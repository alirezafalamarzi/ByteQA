

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";



function Signup() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');


	let navigate = useNavigate();
	const routeChange = () => {
		let path = '/';
		navigate(path);
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		if (username != '' && password != '') {
			fetch('http://localhost:8080/AddNewUser', {
				method: 'POST',
				body: JSON.stringify({
					"username": username,
					"password": password
				}), headers: { 'Content-type': 'application/json' }
			}).then(response => {
				if (response.ok) {
					routeChange();
				} else {
					setError("Error creating new user. It might already exist.");
				}
			})
		}
	}

	return (
		<div className="login-root d-flex justify-content-center align-items-center bg-primary vh-100">
			<div className="bg-white p-3 rounded w-25">
				<h2>Sign Up</h2>
				<form action="" onSubmit={handleSubmit}>
					<div className="mb-3">
						<label htmlFor="username">Username</label>
						<input name="username" type="text" placeholder="Enter Username" className="form-control rounded-0" onChange={
							(event) => {
								setUsername(event.target.value);
							}
						} />
					</div>
					<div className="mb-3">
						<label htmlFor="password">Password</label>
						<input name="password" type="password" placeholder="Enter Password" className="form-control rounded-0" onChange={
							(event) => {
								setPassword(event.target.value);
							}
						} />
					</div>
					<div className="mb-3">
						<span className="text-danger">{error}</span>
					</div>
					<button type="submit" className="btn btn-success w-100">Sign up</button>
					<br />
					<br />
					<Link to="/" className="btn btn-default border w-100">Log In Instead</Link>
				</form>
			</div>
		</div>
	)
}

export default Signup