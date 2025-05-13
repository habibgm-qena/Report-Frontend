import Axios from 'axios';

const createCpClient = () => {
    const baseURL = process.env.NEXT_APP_API_BASE_URL || ''; // Default fallback

    const client = Axios.create({
        baseURL,
        timeout: 30000
        // withCredentials: true,
    });

    // Request interceptor
    client.interceptors.request.use(
        (config) => {
            // const accessToken =
            // // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTczNzAzNTkzMiwiaWF0IjoxNzM2OTQ5NTMyLCJqdGkiOiI1ODg2M2E4Y2NjZDU0ZmM0OGVhNGZhZjc2YTRjM2FlZiIsInVzZXJfaWQiOiI1NmI3ZTNjNy0zNjcxLTQwZDYtOTk3ZC0wM2RiZGMwOWFjNzIiLCJncm91cHMiOlsiQ29ycG9yYXRlQWRtaW4iXSwicHJvZmlsZV9pZCI6ImIwZjdiZDc3LWQzNjItNGI4Yi1hYjNlLTE4OWY1YWRjOGQ4ZSIsImJ1c2luZXNzX25hbWUiOiJiZXJla2V0Iiwic3Vic2NyaXB0aW9uIjpbeyJuYW1lIjoiYWN0aXZlX3BmaV9wcm1fc3Vic2NyaXB0aW9uIiwiZGVzY3JpcHRpb24iOiJhZHJzd3RkZ2ZoaCIsInN1YnNjcmlwdGlvbl9pZCI6ImNlYzA2YjUxLTIxODgtNDk0MC05MTQ3LTYxMGUzNWJiNDZhZCIsInN0YXJ0X2RhdGUiOiIyMDI1LTAxLTIxVDE1OjA1OjAwKzAwOjAwIiwiYW1vdW50X3BhaWQiOiI1MDAuMDAiLCJleHBpcmF0aW9uX2RhdGUiOiIyMDI1LTA0LTMwVDE1OjA1OjAwKzAwOjAwIiwiY3VycmVudF9yZWNvcmQiOjAsImFsbG93ZWRfbnVtYmVyX29mX3JlY29yZHMiOjMwfV0sInBlcm1pc3Npb25zIjpbIkNhbiB2aWV3IGFkZHJlc3MiLCJDYW4gYWRkIHVzZXIiLCJDYW4gY2hhbmdlIGNvcnBvcmF0ZSBwcm9maWxlIl19.UFfLenT46ZkAbHnnGnGT01DinknmUGN4RGCcJolt98o"
            // localStorage.getItem("accessToken");
            // if (accessToken) {
            //   config.headers["Authorization"] = `Bearer ${accessToken}`;
            // }

            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            } else {
                config.headers['Content-Type'] = 'application/json';
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                const refreshToken = localStorage.getItem('refreshToken');

                if (refreshToken) {
                    try {
                        const { data } = await Axios.post(`${baseURL}/auth/refreshToken`, {
                            refreshToken
                        });

                        localStorage.setItem('accessToken', data.accessToken);
                        localStorage.setItem('refreshToken', data.refreshToken);

                        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                        return Axios(originalRequest);
                    } catch (refreshError) {
                        // localStorage.clear();
                        // window.location.reload();
                        return Promise.reject(refreshError);
                    }
                }
            }

            return Promise.reject(error);
        }
    );

    return client;
};

const cpClient = createCpClient();

export default cpClient;
