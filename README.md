# azure-function-post-proxy

Azure function that will transform a http GET Request to a POST Request to the escaped URL specified as a query parameter, passing along the content of the GET Request as well as all other query parameters.

One usage scenario is to trigger a webhook by adding the url to the post-proxy with all query parameters as a favorite to your browser on your mobile. When you open the Url it will trigger a Post to your webhook.

e.g. HTTP GET https://post-proxy.azurewebsites.net/api/PostProxyTrigger?url=https%3A%2F%2Fs2events.azure-automation.net%2Fwebhooks&token=%2okfajklsdjflk%3d

=>

HTTP POST
https://s2events.azure-automation.net/webhooks&token=%2okfajklsdjflk%3d