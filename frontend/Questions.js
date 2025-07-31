/**
 * Name: Ali Falamarzi
 * NSID: ylw576
 * Student No: 11337462
 */

import React, { useEffect, useState } from "react";
import "./App.css"
import { FaTrash } from "react-icons/fa"


function validate(newQuestion) {
	let error = {}

	if (newQuestion.question === "") {
		error.name = "Question should not be empty!";
	}

	return error;
}

function Questions({ login, currentChannel, setCurrentQuestion , questionList, setQuestionList, setCommentList}) {


	const [newQuestion, setQuestion] = useState({
		question: "",
		channel_id: currentChannel.channel_id,
		image: null,
		created_by: login.username
	})

	const [image, setImage] = useState('');

	const [errors, setErrors] = useState({});

	const [searchKey, setSearchKey] = useState('');

	const [searchMethod, setSearchMethod] = useState('Question');


	const handleSearchInput = (event) => {
		setSearchKey(event.target.value);
	}

	const handleSearchMethod = (event) => {
		setSearchMethod(event.target.value);
		console.log(searchMethod);
	}

	const handleSearch = (event) => {
		event.preventDefault();
		if (searchKey.length > 0 && searchMethod === 'Question') {
			fetch('http://localhost:8080/SearchQuestions', {
				method: "POST",
				body: JSON.stringify({
					"key": searchKey,
					"channel_id": currentChannel.channel_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				setQuestionList(response);
			});
		} else if (searchKey.length > 0 && searchMethod === 'User') {
			fetch('http://localhost:8080/SearchQuestionUsers', {
				method: "POST",
				body: JSON.stringify({
					"table": "questions",
					"key": searchKey,
					"channel_id": currentChannel.channel_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				setQuestionList(response);
			});
		} else {
			fetch('http://localhost:8080/GetQuestions', {
				method: "POST",
				body: JSON.stringify({
					"channel_id": currentChannel.channel_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				if (response) {
					setQuestionList(response);
				}
			})
		}
		setSearchKey('');
	}


	const handleInput = (event) => {
		setQuestion(prev => ({ ...prev, [event.target.name]: [event.target.value] }))
	}

	const handleImage = (event) => {
		if (event.target.files && event.target.files[0]) {
			setImage(URL.createObjectURL(event.target.files[0]));
		}
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		setErrors(validate(newQuestion));
		fetch('http://localhost:8080/AddQuestion', {
			method: "POST",
			body: JSON.stringify({
				"question": newQuestion.question[0],
				"channel_id": currentChannel.channel_id,
				"image": image,
				"created_by": login.username
			}),
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => response.json()).then(response => {
			fetch('http://localhost:8080/GetQuestions', {
			method: "POST",
			body: JSON.stringify({
				"channel_id": currentChannel.channel_id
			}),
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => response.json()).then(response => {
			if (response) {
				setQuestionList(response);
			}
		})
		})
		newQuestion.question = "";

	}

	let items;

	useEffect(() => {
		if (currentChannel.channel_id != null && currentChannel.channel_id !== '') {
			fetch('http://localhost:8080/GetQuestions', {
				method: "POST",
				body: JSON.stringify({
					"channel_id": currentChannel.channel_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				if (response) {
					setQuestionList(response);
				}
			})
		}
	}, [currentChannel.channel_id])


	const handleDelete = (question_id) => {
		fetch('http://localhost:8080/deleteQuestion', {
			method: "POST",
			body: JSON.stringify({
				"question_id": question_id
			}),
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => response.json()).then(response => {
			fetch('http://localhost:8080/GetQuestions', {
				method: "POST",
				body: JSON.stringify({
					"channel_id": currentChannel.channel_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				if (response) {
					setQuestionList(response);
					setCommentList([]);
					setCurrentQuestion({});
				}
			})
		})
	}


	if (questionList.map == null) {
		items =
			<div className="">
				<h1>No questions found</h1>
			</div>
	} else if (questionList.length < 1) {
		items =
			<div className="">
				<h1>No questions found</h1>
			</div>
	} else if (login.username === 'admin') {
		items =
			<div className="container h-50 overflow-y-scroll overflow-x-hidden bg-secondary w-75">

				{questionList.map(question => (
					<div key={question.question_id} className="m-2" onClick={() => {
						setCurrentQuestion(question);
					}}>
						<div className="container bg-info">
							<p className="text-truncate"> <span className="badge text-light bg-secondary">{question.created_by}:</span> {question.question} </p>
							<span className="badge text-truncate bg-danger" onClick={
								() => {
									handleDelete(question.question_id);
								}
							}> <FaTrash /> </span>
						</div>
					</div>

				))}
			</div>
	} else {
		items =
			<div className="container h-50 overflow-y-scroll overflow-x-hidden bg-secondary w-75">

				{questionList.map(question => (
					<div key={question.question_id} className="m-2" onClick={() => {
						setCurrentQuestion(question);
					}}>
						<div className="container bg-info">
							<p className="text-truncate"> <span className="badge text-light bg-secondary">{question.created_by}:</span> {question.question} </p>
							{/* <img src={question.image} width={"50px"}></img> */}
						</div>
					</div>

				))}
			</div>
	}

	if (currentChannel.channel_id == null) {
		return (
			<div className="d-flex flex-column justify-content-around align-items-center vh-100 w-25 bg-dark text-light p-5">
				<h5>Please select a channel from the list on the left or create a new one.</h5>
			</div>
		)
	} else {
		return (
			<>
				<div className="d-flex flex-column justify-content-around align-items-center vh-100 w-25 bg-dark text-light">

					<div className="w-75 align-text-center bg-dark text-light">
						<form action="" onSubmit={handleSubmit}>
							<div className="mb-3">
								<textarea name="question" type="text" placeholder="Add New Question..." className="container" value={newQuestion.question} onChange={handleInput}></textarea>
								<br />
								<input type="file" name="file" onChange={handleImage} />
								{errors.question && <span className="text-danger">{errors.name}</span>}
							</div>
							<button type="submit" className="btn btn-success w-100">Add Question</button>
						</form>
						<br />
						<h5 className="align-text-center text-wrap text-break">Channel: {currentChannel.name}</h5>
					</div>
					<br />
					<div className="searchBar w-75">
						<form action="" onSubmit={handleSearch}>
							<input className="w-100 container" type="text" placeholder="Search..." value={searchKey} onChange={handleSearchInput}></input>
							<div className="d-flex align-items-center text-light">
								<button type="submit" className="btn btn-success mt-2">Search</button>
								<div>
									<input className="m-4" type="radio" value="Question" name="kind" defaultChecked onClick={handleSearchMethod} />
									<label htmlFor="Question">By Question</label>
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
}

export default Questions;

