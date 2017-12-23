let google = require('googleapis');

function gsuiteUserManager(mainSpecs) {
    "use strict";
    let auth;
    let service = google.admin('directory_v1');

    function buildRequest(specs) {
        let request = {
            auth: auth
        };

        if (specs.fields) {
            request.fields = specs.fields;
        }

        if (specs.backoff) {
            request.backoff = request;
        }

        if (specs.q) {
            request.q = specs.q;
        }

        if (specs.pageToken) {
            request.pageToken = specs.pageToken;
        }

        return request;
    }

    function doRequest(specs, request, apiCall) {
        return function () {
            return new Promise(function (resolve, reject) {
                if (specs.throttle) {
                    return specs.throttle().then(function () {
                        apiCall(request, function (err, response) {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(response);
                        });
                    });
                }
                return apiCall(request, function (err, response) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(response);
                });
            });
        };
    }

    function getUser(specs) {
        let request = buildRequest(specs);
        let apiCall = service.users.get;

        request.userKey = specs.userKey;
        request.resource = specs.resource;

        if (specs.backoff !== undefined) {
            return specs.backoff({
                promise: doRequest(specs, request, apiCall)
            });
        }
        return doRequest(specs, request, apiCall)();
    }

    function updateUser(specs) {
        let request = buildRequest(specs);
        let apiCall = service.users.update;

        request.userKey = specs.userKey;
        request.resource = specs.resource;

        if (specs.backoff !== undefined) {
            return specs.backoff({
                promise: doRequest(specs, request, apiCall)
            });
        }
        return doRequest(specs, request, apiCall)();
    }

    function getUsers(specs) {
        let request = buildRequest(specs);
        let apiCall = service.users.list;

        request.customer = specs.customer || "my_customer";
        request.maxResults = specs.maxResults || 250;
        request.orderBy = "email";
        request.pageToken = specs.pageToken;

        if (specs.backoff !== undefined) {
            return specs.backoff({
                promise: doRequest(specs, request, apiCall)
            });
        }
        return doRequest(specs, request, apiCall)();
    }

    function getAllUsers(specs) {
        return new Promise(function (resolve) {
            let usersSet = {
                kind: "admin#directory#users",
                users: []
            };

            function rep(localSpecs) {
                return getUsers(localSpecs).then(function (response) {
                    usersSet.users = usersSet.users.concat(response.users);
                    if (response.nextPageToken === undefined || response.users.length === 0) {
                        resolve(usersSet);
                    }

                    if (response.nextPageToken) {
                        localSpecs.pageToken = response.nextPageToken;
                        return rep(localSpecs);
                    }
                });
            }

            rep(specs);
        });
    }

    auth = mainSpecs.auth;
    return {
        getUsers: getUsers,
        getUser: getUser,
        updateUser: updateUser,
        getAllUsers: getAllUsers
    };
}

module.exports = gsuiteUserManager;