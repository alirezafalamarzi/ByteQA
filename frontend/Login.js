/**
 * Name: Ali Falamarzi
 * NSID: ylw576
 * Student No: 11337462
 */

import React, { useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";

function LoginValidation(values) {
	let error = {}


	if (values.username === "") {
		error.username = "Username should not be empty!";
	}

	if (values.password === "") {
		error.password = "Password should not be empty!";
	}

	return error;
}

function Login({ login, setLogin }) {
	const [values, setValues] = useState({
		username: "",
		password: ""
	})

	const [errors, setErrors] = useState({})

	const handleInput = (event) => {
		setValues(prev => ({ ...prev, [event.target.name]: [event.target.value] }))
	}

	let navigate = useNavigate();
	const routeChange = () => {
		let path = '/mainwindow';
		navigate(path);
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		// setErrors(LoginValidation(values));
		fetch('http://localhost:8080/', { method: 'post', body: `{"username": "${values.username}", "password": "${values.password}"}`, headers: { 'Content-type': 'application/json' } }).then(response => {
			if (response.ok) {
				setLogin({
					loggedIn: true,
					username: values.username[0]
				});
				// console.log(login.username);
				routeChange();
			} else {
				console.log("response was not ok");
				setLogin({
					loggedIn: false,
					usename: ''
				});
			}

		})

	}


	return (
		<div className="login-root d-flex justify-content-center align-items-center bg-primary vh-100">
			<div className="bg-white p-3 rounded w-25">
				<div className="text-center bg-warning p-3">
				<h2>Welcome To ByteQA</h2>
				<p>A platform where you can post programming questions, add comments see what others have posted.</p>
				</div>
				<br />
				<h3>Sign In</h3>
				<form action="" onSubmit={handleSubmit}>
					<div className="mb-3">
						<label htmlFor="username">Username</label>
						<input name="username" type="text" placeholder="Enter Username" className="form-control rounded-0" onChange={handleInput} />
						{errors.username && <span className="text-danger">{errors.username}</span>}
					</div>
					<div className="mb-3">
						<label htmlFor="password">Password</label>
						<input name="password" type="password" placeholder="Enter Password" className="form-control rounded-0" onChange={handleInput} />
						{errors.password && <span className="text-danger">{errors.password}</span>}
					</div>
					<button type="submit" className="btn btn-success w-100">Log in</button>
					<br />
					<br />
					<Link to="/signup" className="btn btn-default border w-100">Create Account</Link>
				</form>
			</div>
		</div>
	)
}

export default Login;