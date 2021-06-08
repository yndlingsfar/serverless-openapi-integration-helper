exports.build = function (responses, isProxy) {
    let responseAssignment = {};
    Object.entries(responses).forEach(([response, responseContent]) => {
        responseAssignment[response] = {
            statusCode: response
        };

        if (responseContent.headers && !isProxy) {
            responseAssignment[response].headers = {};
            Object.entries(responseContent.headers).forEach(([header, headerContent]) => {
                responseAssignment[response].headers[`method.response.header.${header}`] = `integration.response.header.${header}`;
            })
        }
    })

    return responseAssignment;
};
