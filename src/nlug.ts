import { Move } from "./types";
import { WHQ } from "./utils";
interface NLUMapping {
  [index: string]: Move[];
}
import {getTopSwedishRestaurants, getTopChineseRestaurants} from "./fetchyelp";
// Changing NLGMapping to Map mapping
type NLGMapping = Map<Move, string>;
var name_1: string;
var name_2: string;
var all_res: Business[];
var res_1: Business; // information from restaurant 1
var res_2: Business; // 

var name_CN1: string;
var name_CN2: string;
var all_CNres: Business[];
var res_CN1: Business; // information from restaurant 1
var res_CN2: Business; // 
// var name_3: string;
// Getting data from API
getTopSwedishRestaurants("Gothenburg");
console.log("====================Starting====================");
async function getData() {
  var res= await getTopSwedishRestaurants("Gothenburg");
  console.log("====================Starting of NLUG Finish====================");
  if (res && res.length > 0) {
      name_1 = res[0].name;
      name_2 = res[1].name;
      res_1 = res[0];
      res_2 = res[1];
      all_res = res;
      // name_3 = res_name[2];
  } else {
      console.log("No data");
  }
}
console.log("====================Starting getData ====================");
getData();

getTopChineseRestaurants("Gothenburg");
console.log("====================Starting CN====================");
async function get_CN_Data() {
  var res= await getTopChineseRestaurants("Gothenburg");
  console.log("====================Starting of CN NLUG Finish====================");
  if (res && res.length > 0) {
    name_CN1 = res[0].name;
    name_CN2 = res[1].name;
    res_CN1 = res[0];
    res_CN2 = res[1];
    all_CNres = res;
      // name_3 = res_name[2];
  } else {
      console.log("No data");
  }
}
console.log("====================Starting get CN Data ====================");
get_CN_Data();
const nluMapping: NLUMapping = {
  "what are the most popular restaurants in gothenburg?": [{
    type: "ask",
    content: WHQ("popular_restaurants"),
  }],
  // "tell me the information?": [{
  //   type: "ask",
  //   content: WHQ("popular_restaurants"),
  // }],
  "swedish": [{
    type: "answer",
    content: "Swedish",
  }],
  "chinese": [{
    type: "answer",
    content: "Chinese",
  }],
};
// Initial nlgMapping
var nlgMapping: NLGMapping = new Map([
  [{ type: "greet", content: null }, "Hello! You can ask me anything of traveling information!"],
  [{ type: "ask", content: WHQ("kind_res") }, "Which category of restaurant?"],
  [{ type: "sorry", content: null }, "Sorry, I don’t understand."],
  [
    {
      type: "answer",
      content: { predicate: "popular_restaurants", argument: "Swedish" },
    },
    `${console.log("===========INITIAL Restaurant Information=============")}`
  ],
  [
    {
      type: "answer",
      content: { predicate: "popular_restaurants", argument: "Chinese" },
    },
    `${console.log("===========INITIAL Restaurant Information=============")}`
  ],
]);
// Define a function to update nlgmapping for real-time update calls
function updateNLGMapping(key:any, newResponse: any) {
  nlgMapping.set(key, newResponse);
  console.log(`NLGMapping updated: ${JSON.stringify(key)} -> ${newResponse}`);
}
// Accessing data from API and update nlgmapping
async function fetchAndUpdateMapping() {
  const data = await fetchData();
  for (const item of data) {
    const { key, response } = item;
    updateNLGMapping(key, response);  // update mapping
  }
}
// Gets the fetchData function from API
async function fetchData() {
  return [
    { 
      key: {
        type: "answer",
        content: { predicate: "popular_restaurants", argument: "Swedish" },
      },
      response: `The most two popular Swedish restaurants are ${name_1} and ${name_2}.
       Firstly for the restaurant ${name_1}, its address is at ${res_1.location.address1} ${res_1.location.city}
       And its rating is ${res_1.rating}. and its flavour category is ${res_1.categories.map(category => category.title).join(", ")}
       For the second restaurant${name_2}, its address is at ${res_2.location.address1} ${res_2.location.city}
       And its rating is ${res_2.rating}. and its flavour category is ${res_2.categories.map(category => category.title).join(", ")} ` 
    },
    {
      key: {
        type: "answer",
        content: { predicate: "popular_restaurants", argument: "Chinese" },
      },
      response: `The most two popular Chinese restaurants are ${name_CN1} and ${name_CN2}.
       Firstly for the restaurant ${name_CN1}, its address is at ${res_CN1.location.address1} ${res_CN1.location.city}
       And its rating is ${res_CN1.rating}. and its flavour category is ${res_CN1.categories.map(category => category.title).join(", ")}
       For the second restaurant${name_CN2}, its address is at ${res_CN2.location.address1} ${res_CN2.location.city}
       And its rating is ${res_CN2.rating}. and its flavour category is ${res_CN2.categories.map(category => category.title).join(", ")} 
       ` 
    },
  ];
}

// Periodically call fetchAndUpdateMapping to update nlgMapping data
setInterval(fetchAndUpdateMapping, 6000); // Update every 6 seconds
export function nlg(moves: Move[]): string {
  console.log("generating moves", moves);
  function generateMove(move: Move): string {
    function objectsEqual(obj1: any, obj2: any): boolean { // A new objectsEqual for judging
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    }   

    let mapping: string | undefined = undefined;

    // Use forEach to traverse the Map to find the items that match the conditions
    nlgMapping.forEach((value, key) => {
        if (objectsEqual(key, move)) {
        mapping = value; 
        }
    });

    if (mapping) {
      console.log("Found mapping:", mapping);
      return mapping;
    } else {
      console.log("Error");
      return "nothing";
    }
  }

  const utterance = moves.map(generateMove).join(' ');
  console.log("generated utterance:", utterance);
    return utterance;

}

/** NLU mapping function can be replaced by statistical NLU
 */
export function nlu(utterance: string): Move[] {
  //getTopSwedishRestaurants("Gothenburg");
  //console.log("====================NLU GET====================",res_name);
  //console.log("====================NLG NAME1====================",name_1);
  // name_1 = res_name[0];
  // name_2 = res_name[1];
  // name_3 = res_name[2];
  return nluMapping[utterance.toLowerCase()] || [];
}
// export async function nlg(moves: Move[]): Promise<string> {
//   console.log("generating moves", moves);

//   async function generateMove(move: Move): Promise<string> {
//     const mapping = nlgMapping.find((x) => objectsEqual(x[0], move));

//     if (mapping) {
//       const response = mapping[1];
//      // if (typeof response === "function") {
//         if ( move.content !== null && "Swedish" in move.content?.toString) {
//           const resNames = await getTopSwedishRestaurants("Gothenburg");
//           return `The most popular Swedish restaurants are`+ resNames;
//         }
//         else if(move.content === null){
//           return "ERROR"; 
//         }
//       //}
//       return response as string; // string return
//     }
//     throw new Error(`Failed to generate move ${JSON.stringify(move)}`);
//   }

//   // all moves response
//   const utterances = await Promise.all(moves.map(generateMove));
//   const utterance = utterances.join(" ");
//   console.log("generated utterance:", utterance);
//   return utterance;
// }

// /** NLU mapping function can be replaced by statistical NLU
//  */
// export function nlu(utterance: string): Move[] {
//   return nluMapping[utterance.toLowerCase()] || [];
// }

