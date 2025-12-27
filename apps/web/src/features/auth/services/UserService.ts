import apiClient from "@/api/apiClient";

export default class UserService {

    static async updateStatus(userId: string, status: string) {
       const response = await apiClient.patch(`/users/${userId}/status`, { status: status });
       return response.data;
    }
}