exports.build = function (responses, type) {
    let responseAssignment = {};
    Object.entries(responses).forEach(([response, responseContent]) => {
        responseAssignment[response] = {
            statusCode: response
        };

        if (responseContent.headers && (type === 'aws' || type === 'http')) {
            responseAssignment[response].headers = {};
            Object.entries(responseContent.headers).forEach(([header, headerContent]) => {
                responseAssignment[response].headers[`method.response.header.${header}`] = `integration.response.header.${header}`;
            })
        }
    })

    return responseAssignment;
};
