
import React, { useEffect, useState } from "react";
import "./App.css"
import { FaRegThumbsUp, FaRegThumbsDown, FaTrash } from "react-icons/fa"


function validate(newComment) {
	let error = {}


	if (newComment.comment === "") {
		error.comment = "Comment should not be empty!";
	}

	return error;
}

function Comments({ login, currentChannel, currentQuestion, commentList, setCommentList }) {


	const [newComment, setComment] = useState({
		comment: "",
		question_id: currentQuestion.question_id,
		created_by: login.username
	})


	const [errors, setErrors] = useState({});

	const [searchKey, setSearchKey] = useState('');

	const [searchMethod, setSearchMethod] = useState('Comment');


	const handleSearchInput = (event) => {
		setSearchKey(event.target.value);
	}

	const handleSearchMethod = (event) => {
		setSearchMethod(event.target.value);
	}

	const handleSearch = (event) => {
		event.preventDefault();
		if (searchKey.length > 0 && searchMethod === 'Comment') {
			fetch('http://localhost:8080/SearchComments', {
				method: "POST",
				body: JSON.stringify({
					"key": searchKey,
					"question_id": currentQuestion.question_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				setCommentList(response);
			});
		} else if (searchKey.length > 0 && searchMethod === 'User') {
			fetch('http://localhost:8080/SearchCommentUsers', {
				method: "POST",
				body: JSON.stringify({
					"table": "comments",
					"key": searchKey,
					"question_id": currentQuestion.question_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				setCommentList(response);
			});
		} else {
			fetch('http://localhost:8080/GetComments', {
				method: "POST",
				body: JSON.stringify({
					"question_id": currentQuestion.question_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				if (response) {
					setCommentList(response);
				}
			})
		}
		setSearchKey('');
	}

	const handleInput = (event) => {
		setComment(prev => ({ ...prev, [event.target.name]: [event.target.value] }))
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		setErrors(validate(newComment));
		fetch('http://localhost:8080/AddComment', {
			method: "POST",
			body: JSON.stringify({
				"comment": newComment.comment,
				"question_id": currentQuestion.question_id,
				"image": null,
				"created_by": login.username
			}),
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => response.json()).then(response => {
			fetch('http://localhost:8080/GetComments', {
				method: "POST",
				body: JSON.stringify({
					"question_id": currentQuestion.question_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				if (response) {
					setCommentList(response);
				}
			});
		});
		newComment.comment = "";
	}

	let items;

	useEffect(() => {
		if (currentQuestion.question_id != null && currentQuestion.question_id !== '') {
			fetch('http://localhost:8080/GetComments', {
				method: "POST",
				body: JSON.stringify({
					"question_id": currentQuestion.question_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				if (response) {
					setCommentList(response);
				}
			})
		}
	}, [currentQuestion.question_id]);


	const likeComment = (comment_id) => {
		fetch('http://localhost:8080/AddCommentLike', {
			method: "POST",
			body: JSON.stringify({
				"comment_id": comment_id,
				"created_by": login.username,
				"is_like": true
			}),
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => {
			if (response.ok) {
				fetch('http://localhost:8080/GetComments', {
					method: "POST",
					body: JSON.stringify({
						"question_id": currentQuestion.question_id
					}),
					headers: {
						"Content-type": "application/json"
					}
				}).then(response => response.json()).then(response => {
					if (response) {
						setCommentList(response);
					}
				})
			}
		});
	}


	const dislikeComment = (comment_id) => {
		fetch('http://localhost:8080/AddCommentDislike', {
			method: "POST",
			body: JSON.stringify({
				"comment_id": comment_id,
				"created_by": login.username,
				"is_like": false
			}),
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => {
			if (response.ok) {
				fetch('http://localhost:8080/GetComments', {
					method: "POST",
					body: JSON.stringify({
						"question_id": currentQuestion.question_id
					}),
					headers: {
						"Content-type": "application/json"
					}
				}).then(response => response.json()).then(response => {
					if (response) {
						setCommentList(response);
					}
				})
			}
		});
	}


	const handleDelete = (comment_id) => {
		fetch('http://localhost:8080/deleteComment', {
			method: "POST",
			body: JSON.stringify({
				"comment_id": comment_id
			}),
			headers: {
				"Content-type": "application/json"
			}
		}).then(response => response.json()).then(response => {
			fetch('http://localhost:8080/GetComments', {
				method: "POST",
				body: JSON.stringify({
					"question_id": currentQuestion.question_id
				}),
				headers: {
					"Content-type": "application/json"
				}
			}).then(response => response.json()).then(response => {
				if (response) {
					setCommentList(response);
				}
			})
		})
	}


	if (commentList.map == null) {
		items =
			<div className="w-100 text-center">
				<h1>No comments found</h1>
			</div>
	}
	else if (commentList.length < 1) {
		items =
			<div className="w-100 text-center">
				<h1>No comments found</h1>
			</div>
	} else if (login.username === 'admin') {
		items =
			<div className="container h-100 w-100">

				{commentList.map(comment => (
					<div key={comment.comment_id} className="d-flex felx-column w-100 m-2">
						{/* <h3> {channel.question_id} </h3> */}
						<div className="container border rounded">
							<p>{comment.created_by}:</p>
							<p>{comment.comment}</p>
						</div>
						<div className="d-flex flex-row flex-column justify-content-start align-items-start">
							<span className="badge bg-success" onClick={
								(event) => {
									likeComment(comment.comment_id);
								}}>
								<FaRegThumbsUp /> {comment.like_count}
							</span>
							<span id="dislike" className="badge bg-danger" onClick={
								(event) => {
									dislikeComment(comment.comment_id);

								}}>
								<FaRegThumbsDown /> {comment.dislike_count}
							</span>
							<span className="badge text-truncate bg-danger" onClick={
								() => {
									handleDelete(comment.comment_id);
								}
							}> <FaTrash /> </span>
						</div>
					</div>


				))}
			</div>
	} else {
		items =
			<div className="container h-100 w-100">

				{commentList.map(comment => (
					<div key={comment.comment_id} className="d-flex felx-column w-100 m-2">
						{/* <h3> {channel.question_id} </h3> */}
						<div className="container border rounded">
							<p>{comment.created_by}:</p>
							<p>{comment.comment}</p>
						</div>
						<div className="d-flex flex-row flex-column justify-content-start align-items-start">
							<span className="badge bg-success" onClick={
								(event) => {
									likeComment(comment.comment_id);
								}}>
								<FaRegThumbsUp /> {comment.like_count}
							</span>
							<span id="dislike" className="badge bg-danger" onClick={
								(event) => {
									dislikeComment(comment.comment_id);

								}}>
								<FaRegThumbsDown /> {comment.dislike_count}
							</span>
						</div>
					</div>


				))}
			</div>
	}
	if (currentChannel.channel_id == null) {
		return (
			<div className="d-flex flex-column justify-content-around align-items-center text-center vh-100 w-50">
				<h5>Please select a channel from the list on the left or create a new one.</h5>
			</div>
		)
	} else if (currentQuestion.question_id == null) {
		return (
			<div className="d-flex flex-column justify-content-around align-items-center vh-100 w-50">
				<h5>Please select a question from the list on the left or create a new one.</h5>
			</div>
		)
	} else {
		return (
			<>
				<div className="d-flex flex-column justify-content-around align-items-center vh-100 w-50 pt-3">

					<div className="container">
						<form action="" onSubmit={handleSubmit}>
							<div className="mb-3">
								<textarea name="comment" type="text" placeholder="Enter Comment" className="form-control" onChange={handleInput} value={newComment.comment}></textarea>
								<br />
								<input type="file" name="file" />
								{errors.question && <span className="text-danger">{errors.name}</span>}
							</div>
							<button type="submit" className="btn btn-success w-100">Add Comment</button>
						</form>
						<br />
						<form action="" onSubmit={handleSearch}>
							<input className="w-100 rounded" type="text" placeholder="Search comment..." value={searchKey} onChange={handleSearchInput}></input>
							<div className="d-flex align-items-center">
								<button type="submit" className="btn btn-success mt-2">Search</button>
								<div>
									<input className="m-4" type="radio" value="Comment" name="kind" defaultChecked onClick={handleSearchMethod} />
									<label htmlFor="Comment">By Comment</label>
									<input className="m-4" type="radio" value="User" name="kind" onClick={handleSearchMethod} />
									<label htmlFor="User">By User</label>
								</div>
							</div>
						</form>
						<br />
					</div>
					<div className="w-100 h-75 overflow-y-scroll">
						<p className="w-100 text-wrap text-break container bg-dark text-light p-3"><span className="badge text-light bg-secondary">{currentQuestion.created_by}: </span> {currentQuestion.question}</p>
						{items}
					</div>

				</div>
			</>
		)
	}
}

export default Comments;

