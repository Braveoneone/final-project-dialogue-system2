// Yelp API Key
const API_KEY = "lZZgHuBl_udnkqGwQvIZGfzaItFdMyHbe-gMb2ysImc9VXgl55Njo_bkmRiBrLW0CHj3uLoZxH7lVU2_kcG04rV8VWazltgxEN2TiLyC4lU5CdYxaQ11hfvAcg4pZ3Yx";
export let res_name: string[] = [];
// let res_comment: string[] = [];
// let res_rating: string[] = [];
// let res_address: string[] = [];
// let res_category: string[] = [];
// Get Response of top swedish restaurants.
export async function getTopSwedishRestaurants(city: string, limit: number = 3): Promise<Business[]> {
    //const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(city)}&sort_by=rating&limit=${limit}`;
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
        // res_name.push(business.name);
        // res_comment.push(business.review_count.toString());
        // res_rating.push(business.rating.toString());
        // res_address.push(business.location.address1 + business.location.city);
        // res_category.push(business.categories.map(category => category.title).join(", "));
      });
      
      return businesses;//, data.map((business: any) => business.rating);
    } catch (error) {
      console.error("Error:", error);
    }
    let no_data: Business[] = [];
    return no_data;
  }


// GetResponse of top chinese restaurants.
export async function getTopChineseRestaurants(city: string, limit: number = 3): Promise<Business[]>{
  const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(city)}&categories=chinese&sort_by=rating&limit=${limit}`;
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
      // res_name.push(business.name);
      // res_comment.push(business.review_count.toString());
      // res_rating.push(business.rating.toString());
      // res_address.push(business.location.address1 + business.location.city);
      // res_category.push(business.categories.map(category => category.title).join(", "));
    });
    return businesses;//, data.map((business: any) => business.rating);
  } catch (error) {
    console.error("Error:", error);
  }
  let no_data: Business[] = [];
  return no_data;
}