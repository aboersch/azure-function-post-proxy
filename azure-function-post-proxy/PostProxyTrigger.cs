using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs.Host;

namespace AzureFunctionsPostProxy
{
    public class PostProxyTrigger
    {
        public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
        {
            var nameValuePairs = req.GetQueryNameValuePairs().ToArray();

            // Get the url. Intentionally use First so that we throw an exception if the url parameter has been omitted from the query
            var escapedUrl = nameValuePairs
                .First(q => q.Key.Equals("url", StringComparison.OrdinalIgnoreCase)).Value;
            var url = Uri.UnescapeDataString(escapedUrl);

            // Get the other query Parameters and make a new query Parameter String
            var queryParameters = string.Join("&",
                nameValuePairs
                    .Where(q => !q.Key.Equals("url", StringComparison.OrdinalIgnoreCase))
                    .Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));


            using (var client = new HttpClient())
            {
                var resp = await client.PostAsync($"{url}?{queryParameters}", req.Content);
                return req.CreateResponse(HttpStatusCode.OK, await resp.Content.ReadAsStringAsync());
            }
        }
    }
}