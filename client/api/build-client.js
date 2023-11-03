import axios from 'axios';

export default ({ req }) => {
    if (typeof window === 'undefined') {
        // We are on the Server, hence requests should be made to http://{Ingress_Service_Name}.{Ingress_Service_NameSpace}.svc.cluster.local/{Route_Path}
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    } else {
        // We are on the Browser, hence requests need not have a base url of some kind rather should only specify the path of the route
        return axios.create({
            baseURL: '/'
        });
    }
}