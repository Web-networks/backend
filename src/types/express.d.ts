declare namespace Express {
    interface IUser {
        id: string;
        email: string;
        username: string;
    }

    interface Session {
        user: IUser;
    }
}
