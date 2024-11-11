import { createActor, setup, AnyMachineSnapshot, sendTo } from "xstate";
import { AnyActorRef, assign, fromPromise } from "xstate";
import { speechstate } from "speechstate";
import { createBrowserInspector } from "@statelyai/inspect";
import { KEY } from "./azure";
import { DMContext, DMEvent, NextMovesEvent } from "./types";
import { nlg, nlu } from "./nlug";
import { dme } from "./dme";
import { initialIS } from "./is";
import {getTopSwedishRestaurants, res_name} from "./fetchyelp";

const inspector = createBrowserInspector();

const azureCredentials = {
  endpoint:
    "https://northeurope.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
  key: KEY,
};
export var name_1: string;
export var name_2: string;
const settings = {
  azureCredentials: azureCredentials,
  asrDefaultCompleteTimeout: 0,
  asrDefaultNoInputTimeout: 5000,
  locale: "en-US",
  azureRegion: "northeurope",
  ttsDefaultVoice: "en-US-DavisNeural",
};

interface MyDMContext extends DMContext {
  noinputCounter: number;
  availableAPIData?: string[];
  messages: Message[]; // Message context
  res_info: string[];
}

interface Message {
  role: "assistant" | "user" | "system";
  content: string;
}

const dmMachine = setup({
  actors: {
    dme: dme,
    get_api_data: fromPromise<any, null>(async () => { // Just another expolration but didn't work
        return getTopSwedishRestaurants("Gothenburg");
    }),
    
  },
  actions: {
    speak_next_moves: ({ context, event }) =>
      context.ssRef.send({
        type: "SPEAK",
        value: {
          utterance: nlg((event as NextMovesEvent).value), //input parameter for nlg
        },
      }),
    listen: ({ context }) =>
      context.ssRef.send({
        type: "LISTEN",
      }),
  },
  types: {} as {
    context: MyDMContext;
    events: DMEvent;
  },
}).createMachine({
  context: ({ spawn }) => ({
    count: 0,
    ssRef: spawn(speechstate, { input: settings }),
    noinputCounter: 0,
    messages: [{role: "system", content: "Let's start to chat!"}],
    is: initialIS(),
    res_info: []
  }),
  id: "DM",
  initial: "Prepare",
  states: {
    Prepare: {
      entry: ({ context }) => context.ssRef.send({ type: "PREPARE" }),
      on: { ASRTTS_READY: "WaitToStart" },
    },
    WaitToStart: {
      on: {
        CLICK: "GetAPI",
      },
    },
    GetAPI: {
      invoke: {
        src: "get_api_data",
        input: null,
        onDone: {
          target: "Main",
          actions: assign(({ event, context }) => {
            // context.messages.push({role: "user"
            //   , content: "why is the sky blue?"}); // First intention by manual input "Why is the sky blue?"
            console.log("[Output information API]", event.output);
            //console.log("[Messages information GetModels]", context.messages); // Json of messages
            context.res_info =  event.output;
            name_1 = event.output[0];
            name_2 = event.output[1];
            return {
              availableAPIData: event.output,
            };
          }),
        },
        onError: {
          actions: () => console.error("no API available"),
        },
      },
    },
    Main: {
      type: "parallel",
      states: {
        Interpret: {
          initial: "Idle",
          states: {
            Idle: {
              on: {
                SPEAK_COMPLETE: { target: "Recognising", actions: "listen" },
              },
            },
            Recognising: {
              on: {
                RECOGNISED: {
                  target: "Idle",
                  actions: [
                    assign(({ context }) => {
                      if(context.availableAPIData != undefined){
                        name_1 = context.availableAPIData[0];
                        name_2 = context.availableAPIData[1];}
                      
                      return {
                        availableAPIData:context.availableAPIData
                      };
                    }),
                    sendTo("dmeID", ({ event }) => ({
                    type: "SAYS",
                    value: {
                      speaker: "usr",
                      moves: nlu(event.value[0].utterance),
                    },
                  }))],
                },
                ASR_NOINPUT: {
                  target: "Idle",
                },
              },
            },
          },
        },
        Generate: {
          initial: "Idle",
          states: {
            Idle: {
              on: {
                NEXT_MOVES: {
                  target: "Speaking",
                  actions: sendTo("dmeID", ({ event }) => ({
                    type: "SAYS",
                    value: {
                      speaker: "sys",
                      moves: event.value,
                    },
                  })),
                },
              },
            },
            Speaking: {
              entry: "speak_next_moves",
              on: {
                SPEAK_COMPLETE: {
                  target: "Idle",
                },
              },
            },
          },
        },
        DME: {
          invoke: {
            src: "dme",
            id: "dmeID",
            input: ({ context, self }) => {
              return {
                parentRef: self,
                latest_moves: context.latest_moves,
                latest_speaker: context.latest_speaker,
                is: context.is,
              };
            },
          },
        },
      },
    },
  },
});

export const dmActor = createActor(dmMachine, {
  inspect: inspector.inspect,
}).start();

let is = dmActor.getSnapshot().context.is;
console.log("[IS (initial)]", is);
dmActor.subscribe((snapshot: AnyMachineSnapshot) => {
  /* if you want to log some parts of the state */
  // is !== snapshot.context.is && console.log("[IS]", snapshot.context.is);
  is = snapshot.context.is;
  // console.log("IS", is);
  console.log(
    "%cState value:",
    "background-color: #056dff",
    snapshot.value,
    snapshot.context.is,
  );
});

export function setupButton(element: HTMLElement) {
  element.addEventListener("click", () => {
    dmActor.send({ type: "CLICK" });
  });
  dmActor
    .getSnapshot()
    .context.ssRef.subscribe((snapshot: AnyMachineSnapshot) => {
      element.innerHTML = `${Object.values(snapshot.getMeta())[0]["view"]}`;
    });
}
