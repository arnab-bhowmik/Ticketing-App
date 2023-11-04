import 'bootstrap/dist/css/bootstrap.css';
import buildClient from "../api/build-client";

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
    <div>
        <h1>Email of the User - {currentUser.email}</h1>
        <Component {...pageProps} />
    </div>
    );
};

AppComponent.getInitialProps = async (context) => {
    const { data } = await buildClient(context.ctx).get('/api/users/currentuser');
    
    // Following is the calling of the method getInitialProps for Landing Page so that it can be passed to index.js i.e. Landing Page!
    let pageProps = {};
    if (context.Component.getInitialProps) {
        pageProps = await context.Component.getInitialProps(context.ctx);
    }

    return { pageProps, ...data };
};

export default AppComponent;