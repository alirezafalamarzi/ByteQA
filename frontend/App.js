/**
 * Name: Ali Falamarzi
 * NSID: ylw576
 * Student No: 11337462
 */

import './App.css';


import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';

import Login from './Login'
import Signup from './Signup'
import MainWindow from './MainWindow';

function App() {


	const [login, setLogin] = useState({
		loggedIn: false,
		username: ''});

	return (
		<BrowserRouter>
			<div>

				<Routes>
				<Route exact path='/' element={<Login login={login} setLogin={setLogin} />} />
				<Route exact path='/signup' element={<Signup />} />
				<Route exact path='/mainwindow' element={<MainWindow login={login} />} />
				</Routes>
			</div>

		</BrowserRouter>
	);
}

export default App;