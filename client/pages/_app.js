import 'bootstrap/dist/css/bootstrap.css';
import buildClient from "../api/build-client";

const AppComponent = ({ Component, pageProps }) => {
    return <Component {...pageProps} />
};

AppComponent.getInitialProps = async (context) => {
    const { data } = await buildClient(context.ctx).get('/api/users/currentuser');
    
    // Following is the calling of the method getInitialProps for Landing Page so that it can be passed to index.js i.e. Landing Page!
    let landingPageProps = {};
    if (context.Component.getInitialProps) {
        landingPageProps = await context.Component.getInitialProps(context.ctx);
    }
    console.log(landingPageProps);
    return data;
};

export default AppComponent;