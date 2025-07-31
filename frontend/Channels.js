/**
 * Name: Ali Falamarzi
 * NSID: ylw576
 * Student No: 11337462
 */

import React, { useEffect, useState } from "react";
import "./App.css"
import { FaTrash } from "react-icons/fa"


function validate(newChannel) {
	let error = {}

	if (newChannel.name === "") {
		error.name = "Channel name should not be empty!";
	}

	return error;
}

function Channels({ login, currentChannel, setCurrentChannel, setCurrentQuestion, setQuestionList, setCommentList}) {
	const [channelList, setChannelList] = useState([]);

	const [newChannel, setChannel] = useState({
		name: ""
	})

	const [errors, setErrors] = useState({})

	const [searchKey, setSearchKey] = useState('');

	const [searchMethod, setSearchMethod] = useState('Channel');



	const handleSearchInput = (event) => {
		setSearchKey(event.target.value);
	}

	const handleSearchMethod = (event) => {
		setSearchMethod(event.target.value);
	}

	const handleSearch = (event) => {
		event.preventDefault();
		if (searchKey.length > 0 && searchMethod === 'Channel') {
			fetch('http://localhost:8080/SearchChannels', {
				method: "POST",
				body: JSON.stringify({
					"key": searchKey
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				setChannelList(response);
			});
		} else if (searchKey.length > 0 && searchMethod === 'User') {
			fetch('http://localhost:8080/SearchChannelUsers', {
				method: "POST",
				body: JSON.stringify({
					"table": "channels",
					"key": searchKey,
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				setChannelList(response);
			});
		} else {
			fetch('http://localhost:8080/GetChannels').then(response => response.json()).then(response => setChannelList(response));
		}
		setSearchKey('');
	}

	const handleInput = (event) => {
		setChannel(prev => ({ ...prev, [event.target.name]: [event.target.value] }))
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		setErrors(validate(newChannel));
		fetch('http://localhost:8080/AddChannel', {
			method: "POST",
			body: JSON.stringify({
				"name": newChannel.name[0],
				"created_by": login.username
			}),
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => response.json()).then(response => {
			fetch('http://localhost:8080/GetChannels').then(response => response.json()).then(response => setChannelList(response));
		})

	}

	const handleDelete = (channel_id) => {
		fetch('http://localhost:8080/deleteChannel', {
			method: "POST",
			body: JSON.stringify({
				"channel_id": channel_id
			}),
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => response.json()).then(response => {
			fetch('http://localhost:8080/GetChannels').then(response => response.json()).then(response => setChannelList(response));
			setQuestionList([]);
			setCommentList([]);
			setCurrentQuestion({});
			setCurrentChannel({});
		})

	}

	useEffect(() => {
		fetch('http://localhost:8080/GetChannels').then(response => response.json()).then(response => setChannelList(response))
	}, []);

	let items;
	if (login.username === 'admin') {
		items =
			<div className="w-75 h-50 overflow-y-scroll bg-primary container rounded">
				{channelList.map(channel => (
					<div key={channel.channel_id} className="m-2" onClick={() => {
						setCurrentChannel(channel);
					}}>
						<div className="container bg-warning">
							<h5 className="text-truncate"> {channel.name}</h5>
							<span className="d-flex flex-column align-items-start">
								<p className="badge text-truncate bg-success">Created By: {channel.created_by} </p>
							</span>
							<span className="badge text-truncate bg-danger" onClick={
									() => {
										handleDelete(channel.channel_id);
									}
								}> <FaTrash />
							</span>

						</div>
					</div>

				))}
			</div>
	} else {
		items =
			<div className="w-75 h-50 overflow-y-scroll bg-primary container rounded">
				{channelList.map(channel => (
					<div key={channel.channel_id} className="m-2" onClick={() => {
						setCurrentChannel(channel);
					}}>
						<div className="container bg-warning">
							<h5 className="text-truncate"> {channel.name}</h5>
							<span className="badge text-truncate bg-success"> Created By: {channel.created_by}</span>
						</div>
					</div>

				))}
			</div>
	}

	return (
		<>
			<div className="d-flex flex-column justify-content-around align-items-center vh-100 w-25 bg-secondary">
				<div>
					<form action="" onSubmit={handleSubmit}>
						<div className="mb-3">
							<h6 className="text-light w-100 text-center">Create a New Channel</h6>
							<input name="name" type="text" placeholder="Enter Channel Name" className="form-control" onChange={handleInput} />
							{errors.name && <span className="text-danger">{errors.name}</span>}
						</div>
						<button type="submit" className="btn btn-success w-100">Create Channel</button>
					</form>
				</div>
				<br />

				<div className="searchBar w-75">
					<form action="" onSubmit={handleSearch}>
						<input className="w-100 container" placeholder="Search Channel..." type="text" value={searchKey} onChange={handleSearchInput}></input>
						<div className="d-flex align-items-center text-light">
							<button type="submit" className="btn btn-success mt-2">Search</button>
							<div>
								<input className="m-4" type="radio" value="Channel" name="kind" defaultChecked onClick={handleSearchMethod} />
								<label htmlFor="Channel">By Channel</label>
								<input className="m-4" type="radio" value="User" name="kind" onClick={handleSearchMethod} />
								<label htmlFor="User">By User</label>
							</div>
						</div>
					</form>
				</div>
				{items}
			</div>
		</>
	)
}

export default Channels;

