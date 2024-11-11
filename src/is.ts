import { InformationState } from "./types";
import {
  objectsEqual,
  WHQ,
  findout,
  consultDB,
  getFactArgument,
} from "./utils";

export const initialIS = (): InformationState => {
  const predicates: { [index: string]: string } = {
    kind_res: "res"
  };
  const individuals: { [index: string]: string } = {
    Swedish: "res",
    Chinese: "res"
  };
  return {
    domain: {
      predicates: predicates,
      individuals: individuals,
      relevant: (a, q) => {
        if (
          typeof a === "string" &&
          predicates[q.predicate] === individuals[a]
        ) {
          return true;
        }
        if (typeof a === "object" && q.predicate === a.predicate) {
          return true;
        }
        return false;
      },
      resolves: (a, q) => {
        if (typeof a === "object" && q.predicate === a.predicate) {
          return true;
        }
        return false;
      },
      combine: (q, a) => {
        if (
          typeof a === "string" &&
          predicates[q.predicate] === individuals[a]
        ) {
          return { predicate: q.predicate, argument: a };
        }
        if (typeof a === "object" && q.predicate === a.predicate) {
          return a;
        }
        throw new Error("Combine failed.");
      },
      plans: [
        {
          type: "issue",
          content: WHQ("popular_restaurants"),
          plan: [//add question in plan orderly
            findout(WHQ("kind_res")), 
            //findout(WHQ("course_day")),
            consultDB(WHQ("popular_restaurants")),
          ],
        },
      ],
    },
    database: {
      consultDB: (question, facts) => {
        if (objectsEqual(question, WHQ("popular_restaurants"))) {
          const res = getFactArgument(facts, "kind_res");
          console.log(res);
          if (res == "Swedish") {
            return { predicate: "popular_restaurants", argument: "Swedish" };
          }
          else if (res == "Chinese") {
            return { predicate: "popular_restaurants", argument: "Chinese" };
          }
        }
        return null;
      },
    },
    next_moves: [],
    private: {
      plan: [],
      agenda: [
        {
          type: "greet",
          content: null,
        },
      ],
      bel: [{ predicate: "favorite_food", argument: "pizza" }],
    },
    shared: { lu: undefined, qud: [], com: [] },
  };
};
