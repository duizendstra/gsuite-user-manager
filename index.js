var google = require('googleapis');

function googleUserManager(mainSpecs) {
    "use strict";
    var auth;
    var service = google.admin('directory_v1');

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
        getUsers: getUsers
    };
}

module.exports = googleUserManager;