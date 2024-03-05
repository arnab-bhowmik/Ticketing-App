import Router from 'next/router';
import { useEffect } from "react";
import useRequest from '../../hooks/use-request';

export default () => {
    const { doRequest, errors } = useRequest();

    useEffect(() => {
        doRequest({ 
            url: '/api/users/signout',
            method: 'post',
            body: {},
            onSuccess: () => Router.push('/'),
            props: {}
        });
    }, []);

    return <div>
        Signing you out...!
        {errors}
    </div>;
};