import 'bootstrap/dist/css/bootstrap.css';
import { NextUIProvider } from '@nextui-org/react';
import buildClient from "../api/build-client";
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
              <NextUIProvider>
                <Component currentUser={currentUser} {...pageProps} />
              </NextUIProvider>
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async (context) => {
    const client = buildClient(context.ctx);
    const { data } = await client.get('/api/users/currentuser');
    
    // Following is the calling of the method getInitialProps for Landing Page so that it can be passed to index.js i.e. Landing Page!
    let pageProps = {};
    if (context.Component.getInitialProps) {
        pageProps = await context.Component.getInitialProps(context.ctx, client, data.currentUser);
    }

    return { pageProps, ...data };
};

export default AppComponent;