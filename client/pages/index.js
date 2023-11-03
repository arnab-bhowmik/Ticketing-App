import axios from 'axios';

const Landing = ({ currentUser }) => {
    console.log(currentUser);
    return <h1>Landing Page</h1>;
};

// Method allows to fetch data that needs to be shown on the UI Component
Landing.getInitialProps = async ({ req }) => {
    console.log(req.headers);
    if (typeof window === 'undefined') {
        // We are on the Server, hence requests should be made to http://{Ingress_Service_Name}.{Ingress_Service_NameSpace}.svc.cluster.local/{Route_Path}
        const { data } = await axios.get('http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser', {
            headers: req.headers
        }); 
        return data;
    } else {
        // We are on the Browser, hence requests need not have a base url of some kind rather should only specify the path of the route
        const { data } = await axios.get('/api/users/currentuser'); 
        return data;
    }
};
   
export default Landing;