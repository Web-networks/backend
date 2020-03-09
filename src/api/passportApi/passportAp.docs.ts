/**
 *
 * @api {post} /passport/signin SingIn user
 * @apiName SignIn
 * @apiGroup Passport
 *
 *
 * @apiParam  {String} email User's email
 * @apiParam  {String} password User's password
 *
 * @apiSuccess (202) {String} id User's id
 * @apiSuccess (202) {String} email User's email
 * @apiSuccess (202) {String} username User's username
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *     "email": "test@mail.ru",
 *     "password": "test",
 * }
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *     "email": "test@mail.ru",
 *     "id": "sdkfj1lkqskl234lkjasf234",
 *     "username": "testUser",
 * }
 */

/**
  *
  * @api {post} /passport/signup Register new user
  * @apiName SignUp
  * @apiGroup Passport
  *
  *
  * @apiParam  {String} email Email of user
  * @apiParam  {String} password Password of user (from 5 to 10 symbols)
  * @apiParam  {String} username Unique username
  *
  * @apiSuccess (201) {String} id User's id
  * @apiSuccess (201) {String} email User's email
  * @apiSuccess (201) {String} username User's username
  *
  * @apiParamExample  {json} Request-Example:
  * {
  *     "email": "test@mail.ru",
  *     "password": "password",
  *     "username": "user",
  * }
  *
  *
  * @apiSuccessExample {json} Success-Response:
  * {
  *     "email": "test@mail.ru",
  *     "id": "laskdfj234k5j12ljasdf",
  *     "username": "user",
  * }
  *
  *
  */
