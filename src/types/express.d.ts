declare namespace Express {
    interface IUser {
        id: string;
        email: string;
        name: string;
    }

    interface Session {
        user: IUser;
    }
}
