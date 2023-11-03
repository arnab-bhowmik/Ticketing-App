import buildClient from "../api/build-client";

const Landing = ({ currentUser }) => {
    console.log(currentUser);
    return <h1>Landing Page</h1>;
};

// Method allows to fetch data that needs to be shown on the UI Component. Importing buildClient lets us create an Axios instance.
Landing.getInitialProps = async (context) => {
    const { data } = await buildClient(context).get('/api/users/currentuser');
    return data;
};
   
export default Landing;