var google = require('googleapis');

function googleUserManager(specs) {
    "use strict";
    var auth;
    var service = google.admin('directory_v1');

    function getUsers(specs) {
        var usersSet = {
            kind: "admin#directory#users",
            users: []
        };

        var orgUnitPath = specs.orgUnitPath

        return new Promise(function (resolve, reject) {
            function listUsers(pageToken) {
                service.users.list({
                    auth: auth,
                    fields: "nextPageToken, users/orgUnitPath, users/primaryEmail",
                    customer: 'my_customer',
                    maxResults: 250,
                    orderBy: 'email',
                    pageToken: pageToken
                }, function (err, response) {
                    if (err) {
                        reject('The API returned an error: ' + err);
                        return;
                    }
                    var users = response.users;

                    if (users.length === 0) {
                        resolve(usersSet);
                        return;
                    }
                    users.forEach(function (user) {
                        if (!orgUnitPath || user.orgUnitPath === orgUnitPath) {
                            usersSet.users.push({
                                primaryEmail: user.primaryEmail
                            });
                        }
                    });
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

    auth = specs.auth;
    return {
        getUsers: getUsers
    };
}

module.exports = {
    googleUserManager: googleUserManager
};