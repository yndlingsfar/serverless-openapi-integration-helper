exports.build = function (params) {
    let parameterAssignments = {};
    params.forEach(element => {
        parameterAssignments[`integration.request.${element.in}.${element.name}`] =`method.request.${element.in}.${element.name}`
    })

    return parameterAssignments;
};
