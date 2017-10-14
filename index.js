var google = require('googleapis');

function gsuiteUserManager(mainSpecs) {
    "use strict";
    var auth;
    var service = google.admin('directory_v1');

    function updateUser(specs) {
        var userKey = specs.userKey;
        var resource = specs.resource;
        var request = {
            auth: auth,
            userKey: userKey,
            resource: resource
        };

        return new Promise(function (resolve, reject) {
            service.users.update(request, function (err, response) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(response);
            });
        });
    }

    function getUser(specs) {
        var userKey = specs.userKey;
        var resource = specs.resource;
        var request = {
            auth: auth,
            userKey: userKey,
            resource: resource
        };

        return new Promise(function (resolve, reject) {
            service.users.get(request, function (err, response) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(response);
            });
        });
    }

    function getUsers(specs) {
        var usersSet = {
            kind: "admin#directory#users",
            users: []
        };

        var orgUnitPath = specs.orgUnitPath;

        return new Promise(function (resolve, reject) {
            var request = {
                auth: auth,
                customer: specs.customer || 'my_customer',
                maxResults: specs.maxResults || 250,
                orderBy: 'email'
            };
            if (specs.fields) {
                // TODO add nextpagetoken if missing
                request.fields = specs.fields;
            }
            if (orgUnitPath) {
                request.orgUnitPath = orgUnitPath;

            }
            if (specs.projection) {
                request.projection = specs.projection;
            }
            if (specs.query) {
                request.query = specs.quer;
            }

            function listUsers(pageToken) {
                if (pageToken) {
                    request.pageToken = pageToken;
                }
                service.users.list(request, function (err, response) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var users = response.users;
                    users.forEach(function (user) {
                        if (!orgUnitPath || user.orgUnitPath === orgUnitPath) {
                            usersSet.users.push(user);
                        }
                    });
                    if (users.length === 0) {
                        resolve(usersSet);
                        return;
                    }
                    if (!response.nextPageToken) {
                        resolve(usersSet);
                        return;
                    }
                    listUsers(response.nextPageToken);
                });
            }
            listUsers();
        });
    }

    auth = mainSpecs.auth;
    return {
        getUsers: getUsers,
        getUser: getUser,
        updateUser: updateUser
    };
}

module.exports = gsuiteUserManager;