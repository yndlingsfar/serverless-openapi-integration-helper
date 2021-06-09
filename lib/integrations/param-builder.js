exports.build = function (params) {
    let parameterAssignments = {};
    let mapping = {
        path: 'path',
        header: 'header',
        query: 'querystring'
    }
    params.forEach(element => {
        let requestParamLocation = mapping[element.in];
        if (requestParamLocation) {
            parameterAssignments[`integration.request.${requestParamLocation}.${element.name}`] =`method.request.${requestParamLocation}.${element.name}`
        }
    })

    return parameterAssignments;
};
