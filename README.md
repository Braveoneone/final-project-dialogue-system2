# Report Yiyi Wang
## 1. Introduction
Interface to API application
Information State Update (ISU)
Develop a travel recommendation application whose main function is to recommend tourist restaurants, activities, etc. 
Use a travel information API, such as the TripAdvisor API or Yelp API, to get details, reviews, locations, and so on about individual restaurants.
### Yelp Fusion API
Website of API: *https://docs.developer.yelp.com/docs/getting-started* 
Provide detailed information about restaurants, hotels, attractions, etc., including opening hours, user reviews, ratings, etc.
Support location query (by city, latitude and longitude, etc.), category filtering (such as restaurants, cafes, attractions, etc.).
Support for multiple languages and partial international data, which is very useful when developing global applications.
## 2. Data collection
### 2.1 Scenario
Suppose there are two participants in a role play:
Participant A: Acted as an application to provide travel recommendation services.
Participant B: Play the role of a user who wants to find an attraction suitable for a weekend trip.
#### Scene setting
User B recently had a few days of vacation and wanted to relax in a place not far from his city. He was not sure where to go. Users want detailed recommendations of attractions, including interesting places to go, good places to eat, accommodation suggestions, etc. Users may also mention personal needs, such as "I like the quiet environment" or "I want to try the local cuisine."  
### 2.2 Distillation and analysis results
Common needs of users: Users may repeatedly ask for "scenic spot recommendations", "food recommendations", "accommodation recommendations", etc.
Structure of dialogue: Users often start by asking a general question and then go deeper, possibly personalizing their recommendations.
Fixed expressions and intentions: "What are the interesting places?" "restaurant recommendations nearby"
#### Results
Identify the core functional modules of the application:
For a travel recommendation app, the core functions might include modules such as "attraction recommendation", "food recommendation", "Accommodation recommendation", etc.
# 3. Implementation (🚀🚀🚀HighLight and Creative Part🚀🚀🚀)
For solving the creative problem of how to implement API in ISU basing on the Lab 1 coding project, I think the key challenge is how to update nlg dynamically. For dynamically updating, I changed the type of NLGMapping from a simple [Move, string] type to Map<Move, string> type.

## 4. Sample dialogues
sys: Hello! You can ask me anything of traveling information!  
usr: what are the most popular restaurants in gothenburg?  
sys: Which category of restaurant?  
usr: Swedish  
sys: The most two popular Swedish restaurants are Sandberg Månsson and Smaka.
       Firstly for the restaurant Sandberg Månsson, its address is at Magasinsgatan 26 Gothenburg
       And its rating is 4.8. and its flavour category is Swedish, Scandinavian
       For the second restaurantSmaka, its address is at Vasaplatsen 3 Göteborg
       And its rating is 4.4. and its flavour category is Bars, Swedish.  
## 5. Discussion 
### 5.1 First Challenge
I have spent a long time to implement a real-time interaction between ISU, NLUG and API application. Also, I met many problem, for example, firstly, I realized the Promise method in *isu.ts* like Lab 2:    
```
actors: {
    dme: dme,
    get_api_data: fromPromise<any, null>(async () => { // Just another expolration but didn't work
        return getTopSwedishRestaurants("Gothenburg");
    }),
    
  },
speak_next_moves: ({ context, event }) =>
      context.ssRef.send({
        type: "SPEAK",
        value: {
          utterance: nlg((event as NextMovesEvent).value), //input parameter for nlg
        },
      }),
```
I want to pass the API data by nlg function but it didn't work because I figure out that, when this application start to run, the nlgMapping would be initialized immediately. However, as we know, it will take a few time to POST and GET from remote API. So this is a real technical challenge for me to find another way if I want to implement API basing on our Lab 1 coding.
### 5.2 Second Challenge
Therefore, I turned to another direction like implementing Promise on the function nlg and nlu in *nlug.ts*.
```
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
```
However, I met a new problem that, the nlg mapping cannot run as normally as before. Since nlg is Promise type of function, but NLGMapping is just a static type, which means it cannot implement asynchronous running between function and function.
### 5.3 Solution
Finally, after a lot of days exploring, coding, testing and debuging, also with figuring out the structure of every coding file in directory, I implement it successfully. I have described the solution with detail in **Section 3. Implementation** and **Section 7. Code**. It's a really creative implement explored by myself.  
## 6. Future work
More conversations and more content. Add UI interface to show the returning infomation from API. Make it like a real recommandation application. I think it will be lots of creative things that I can do for this application.
## 7. Code
*structyelp.ts* is a script designed for storing API returing data according to its format.
```
// Restaurant Interface
interface Business {
    name: string;
    rating: number;
    review_count: number;
    location: Location;
    categories: { title: string }[];
    imageUrl: string;
    isClosed: boolean;
    url: string;
    reviewCount: number;
    phone: string;
    displayPhone: string;
    distance: number;
    businessHours: BusinessHour[];
    attributes: Attributes;
  }

// Restaurant Category Interface
interface Category {
  alias: string;
  title: string;
}

// Restaurant Coordinates Interface
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Restaurant Location Interface
interface Location {
  address1: string;
  address2: string | null;
  address3: string | null;
  city: string;
  zipCode: string;
  country: string;
  state: string;
  displayAddress: string[];
}

// Restaurant BusinessHour Interface
interface BusinessHour {
  open: OpenHour[];
  hoursType: string;
  isOpenNow: boolean;
}

// Restaurant OpenHour Interface
interface OpenHour {
  isOvernight: boolean;
  start: string;
  end: string;
  day: number;
}

// Others
interface Attributes {
  businessTempClosed: boolean | null;
  menuUrl: string | null;
  open24Hours: boolean | null;
  waitlistReservation: boolean | null;
}

// Yelp json
interface YelpResponse {
  businesses: Business[];
  total: number;
  region: Region;
}

// Center of Region
interface Region {
  center: Coordinates;
}

```
fetchyelp.ts is the script for getting raw json data from remote API by posting. Its main part is an export async *getTopNationRestaurants* function in which city name is an input parameter and Promise<Business[]> as a return.
```
// Yelp API Key
const API_KEY = "lZZgHuBl_udnkqGwQvIZGfzaItFdMyHbe-gMb2ysImc9VXgl55Njo_bkmRiBrLW0CHj3uLoZxH7lVU2_kcG04rV8VWazltgxEN2TiLyC4lU5CdYxaQ11hfvAcg4pZ3Yx";
export let res_name: string[] = [];
export async function getTopSwedishRestaurants(city: string, limit: number = 3): Promise<Business[]> {
    const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(city)}&categories=swedish&sort_by=rating&limit=${limit}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      // check whether it is successful
      if (!response.ok) {
        throw new Error(`error of response: ${response.statusText}`);
      }
      // json data
      const data = await response.json();
      const businesses: Business[] = data.businesses;
      let count_res = 0;
      // most three
      businesses.forEach((business) => {
        count_res = count_res + 1;
        console.log(`--------------------Restaurant ${count_res}------------------------------`);
        console.log(`name: ${business.name}`);
        console.log(`rating: ${business.rating}`);
        console.log(`comments: ${business.review_count}`);
        console.log(`address: ${business.location.address1}, ${business.location.city}`);
        console.log(`category: ${business.categories.map(category => category.title).join(", ")}`);
        console.log("-------------------------------------------------------------------------");
      });
      return businesses;//, data.map((business: any) => business.rating);
    } catch (error) {
      console.error("Error:", error);
    }
    let no_data: Business[] = [];
    return no_data;
  }

```
#### 8. collected dialogues, distilled dialogues
##### Swedish restaurants
sys: Hello! You can ask me anything of traveling information!  
usr: what are the most popular restaurants in gothenburg?  
sys: Which category of restaurant?  
usr: Swedish  
sys: The most two popular Swedish restaurants are Sandberg Månsson and Smaka.
       Firstly for the restaurant Sandberg Månsson, its address is at Magasinsgatan 26 Gothenburg
       And its rating is 4.8. and its flavour category is Swedish, Scandinavian
       For the second restaurantSmaka, its address is at Vasaplatsen 3 Göteborg
       And its rating is 4.4. and its flavour category is Bars, Swedish.
##### Chinese restaurants
sys: Hello! You can ask me anything of traveling information!  
usr: what are the most popular restaurants in gothenburg?  
sys: Which category of restaurant?  
usr: Chinese  
sys: The most two popular Chinese restaurants are Jinx Foodtruck and Dubbel Dubbel Kolibri.
       Firstly for the restaurant Jinx Foodtruck, its address is at Magasinsgatan 17 Göteborg
       And its rating is 4.6. and its flavour category is Cantonese, Fast Food, Food Stands
       For the second restaurantDubbel Dubbel Kolibri, its address is at Surbrunnsgatan 8 Gothenburg
       And its rating is 4.5. and its flavour category is Bars, Chinese, Asian Fusion 
