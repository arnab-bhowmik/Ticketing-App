import Router from 'next/router';
import { useState } from "react";
import useRequest from '../../hooks/use-request';

export default () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest();

    const onSubmit = async (event) => {
        event.preventDefault();
        // Define what happens once User attempts to Sign Up!
        doRequest({ 
            url: '/api/users/signup',
            method: 'post',
            body: { name, email, password },
            onSuccess: () => Router.push('/'),
            props: {}
        });
    };

    return <form onSubmit={onSubmit}>
        <h1>Sign Up</h1>
        <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="form-control"/>
        </div>
        <div className="form-group">
            <label>Email Address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="form-control"/>
        </div>
        <div className="form-group">
            <label>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-control"/>
        </div>
        {errors}
        <button className="btn btn-primary">Sign Up</button>
    </form>;
};