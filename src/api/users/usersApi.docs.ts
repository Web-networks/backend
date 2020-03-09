/**
 *
 * @api {get} /find Find users
 * @apiName Find users
 * @apiGroup Users
 *
 *
 * @apiParam  {String} [username] Part of username
 * @apiParam  {Number} [limit] Limit of found users
 *
 * @apiSuccess (200) {Object[]} users Users profiles
 * @apiSuccess (200) {String} users.username username
 * @apiSuccess (200) {String} users.id user id
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *     "username" : "test",
 * }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "users" : [{
 *          "username": "test1",
 *          "id": "lskadjf1234asd", 
 *     }, {
 *          "username": "test2",
 *          "id": "fdgs234mm13",
 *      }]
 * }
 */
