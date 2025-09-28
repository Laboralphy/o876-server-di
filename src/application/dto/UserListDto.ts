export type UserListItem = {
    id: string;
    name: string;
    tsCreated: number;
    tsLogin: number;
    email: string;
};
export type UserListDto = UserListItem[];
