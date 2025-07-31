/**
 * Name: Ali Falamarzi
 * NSID: ylw576
 * Student No: 11337462
 */

import { useState } from "react";
import Channels from "./Channels";
import Questions from "./Questions";
import Comments from "./Comments";

const MainWindow = ({login}) => {
	const[currentChannel, setCurrentChannel] = useState({})
	const[currentQuestion, setCurrentQuestion] = useState({})

	const [commentList, setCommentList] = useState([]);
	const [questionList, setQuestionList] = useState([]);

	if(login.loggedIn === true) {
		return (
			<div className="d-flex">
			<Channels login={login}
			currentChannel={currentChannel}
			setCurrentChannel={setCurrentChannel}
			setCurrentQuestion={setCurrentQuestion}
			setQuestionList={setQuestionList}
			setCommentList={setCommentList}/>
			<Questions login={login}
			currentChannel={currentChannel}
			setCurrentQuestion={setCurrentQuestion}
			questionList={questionList}
			setQuestionList={setQuestionList}
			setCommentList={setCommentList}/>
			<Comments login={login}
			currentChannel={currentChannel}
			currentQuestion={currentQuestion}
			commentList={commentList}
			setCommentList={setCommentList}/>
			</div>
		);
	} else {
		return (
			<>
			<h1>You are not logged in.</h1>
			</>
		)
	}

}

export default MainWindow;