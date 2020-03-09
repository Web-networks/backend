define({ "api": [
  {
    "type": "post",
    "url": "/passport/signin",
    "title": "SingIn user",
    "name": "SignIn",
    "group": "Passport",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User's email</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>User's password</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"email\": \"test@mail.ru\",\n    \"password\": \"test\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "202": [
          {
            "group": "202",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User's id</p>"
          },
          {
            "group": "202",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User's email</p>"
          },
          {
            "group": "202",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>User's username</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"email\": \"test@mail.ru\",\n    \"id\": \"sdkfj1lkqskl234lkjasf234\",\n    \"username\": \"testUser\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/passportApi/passportAp.docs.ts",
    "groupTitle": "Passport"
  },
  {
    "type": "post",
    "url": "/passport/signup",
    "title": "Register new user",
    "name": "SignUp",
    "group": "Passport",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password of user (from 5 to 10 symbols)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Unique username</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"email\": \"test@mail.ru\",\n    \"password\": \"password\",\n    \"username\": \"user\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User's id</p>"
          },
          {
            "group": "201",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User's email</p>"
          },
          {
            "group": "201",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>User's username</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"email\": \"test@mail.ru\",\n    \"id\": \"laskdfj234k5j12ljasdf\",\n    \"username\": \"user\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/passportApi/passportAp.docs.ts",
    "groupTitle": "Passport"
  },
  {
    "type": "get",
    "url": "/find",
    "title": "Find users",
    "name": "Find_users",
    "group": "Users",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "username",
            "description": "<p>Part of username</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limit",
            "description": "<p>Limit of found users</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"username\" : \"test\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "users",
            "description": "<p>Users profiles</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "users.username",
            "description": "<p>username</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "users.id",
            "description": "<p>user id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"users\" : [{\n         \"username\": \"test1\",\n         \"id\": \"lskadjf1234asd\", \n    }, {\n         \"username\": \"test2\",\n         \"id\": \"fdgs234mm13\",\n     }]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/users/usersApi.docs.ts",
    "groupTitle": "Users"
  }
] });
