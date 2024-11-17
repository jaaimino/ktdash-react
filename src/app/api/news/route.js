import { GetNews } from "@/app/data/News/GetNews.js";

/**
 * Returns an array of News objects from the database based on input usernam.
 * @function
 * @async
 * @param {Object} req - The Http Request for this API call
 * @returns {Promise<Object>} A promise that resolves to an object containing the result of the request.
 * @throws {Error} If an error occurs.
 */
export async function GET(req) {
  /*
  Sample API request: /api/news?max=20
  */
  let [max] = [
    req.nextUrl.searchParams.get("max") ?? 20,
  ];

  // Get the news objects
  let news = await GetNews(parseInt(max));

  return Response.json(news);
}
