// import buildClient from "../api/build-client";

const Landing = ({ currentUser }) => {
    return currentUser ? <h1>Signed In Successfully!</h1> : <h1>User not Signed In!</h1>
};

// Method allows to fetch data that needs to be shown on the UI Component. Importing buildClient lets us create an Axios instance.
Landing.getInitialProps = async (context, client, currentUser) => {
    // const { data } = await buildClient(context).get('/api/users/currentuser');
    // return data;
    return {};
};
   
export default Landing;