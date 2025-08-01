'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql')
const cors = require('cors')

const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();
app.use(bodyParser.json());
app.use(cors())
app.use(express.json())

const connection = mysql.createConnection({
	host: 'mysql-db',
	user: 'root',
	password: 'admin'
});

function createDatabase() {
	connection.connect();
	connection.query('CREATE DATABASE IF NOT EXISTS postsdb', (error, result) => {
		if (error) {
			console.log(error);
		} else {
			console.log("[*] Database 'postsdb' created.");
		}
	});
	connection.query(`USE postsdb`, (error, results) => {
		if (error) {
			console.log(error);
		} else {
			console.log("[*] Using database 'postsdb'");
		}
	});

	connection.query(`CREATE TABLE IF NOT EXISTS Users(
		user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL,
		image BLOB,
		FULLTEXT KEY (username))`, (error, result) => {
		if (error) {
			console.log(error);
		} else {
			console.log("[*] Table 'Users' created.");
		}
	});
	connection.query(
		`CREATE TABLE IF NOT EXISTS Channels(
		channel_id INTEGER NOT NULL AUTO_INCREMENT,
		name VARCHAR(255) NOT NULL,
		created_by VARCHAR(255) NOT NULL,

		PRIMARY KEY (channel_id),
		FOREIGN KEY (created_by) REFERENCES Users(username) ON DELETE CASCADE,
		FULLTEXT KEY (name))`,
		(error, result) => {
			if (error) {
				console.log(error);
			} else {
				console.log("[*] Table 'Channels' created.");
			}
		});
	connection.query(
		`CREATE TABLE IF NOT EXISTS Questions(
		question_id INTEGER NOT NULL AUTO_INCREMENT,
		question TEXT NOT NULL,
		image TEXT,
		channel_id INTEGER NOT NULL,
		created_by VARCHAR(255) NOT NULL,
		like_count INTEGER DEFAULT 0,
		dislike_count INTEGER DEFAULT 0,


		PRIMARY KEY (question_id),
		FOREIGN KEY (channel_id) REFERENCES Channels (channel_id) ON DELETE CASCADE,
		FOREIGN KEY (created_by) REFERENCES Users(username) ON DELETE CASCADE,
		FULLTEXT KEY (question))`,
		(error, result) => {
			if (error) {
				console.log(error);
			} else {
				console.log("[*] Table 'Questions' created.");
			}
		});

	connection.query(
		`CREATE TABLE IF NOT EXISTS Comments(
		comment_id INTEGER NOT NULL AUTO_INCREMENT,
		comment TEXT NOT NULL,
		image BLOB,
		question_id INTEGER NOT NULL,
		sub_comment_id INTEGER,
		created_by VARCHAR(255) NOT NULL,
		like_count INTEGER DEFAULT 0,
		dislike_count INTEGER DEFAULT 0,

		PRIMARY KEY (comment_id),
		FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE,
		FOREIGN KEY (sub_comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
		FOREIGN KEY (created_by) REFERENCES Users(username) ON DELETE CASCADE,
		FULLTEXT KEY (comment))
		`,
		(error, result) => {
			if (error) {
				console.log(error);
			} else {
				console.log("[*] Table 'Comments' created.");
			}
		});

	connection.query(
		`CREATE TABLE IF NOT EXISTS QuestionLikes(
		question_id INTEGER NOT NULL,
		created_by VARCHAR(255) NOT NULL,
		is_like BOOLEAN NOT NULL,

		FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE,
		FOREIGN KEY (created_by) REFERENCES Users(username) ON DELETE CASCADE,
		PRIMARY KEY (question_id, created_by))`,
		(error, result) => {
			if (error) {
				console.log(error);
			} else {
				console.log("[*] Table 'QuestionLikes' created.");
			}
		});

	connection.query(
		`CREATE TABLE IF NOT EXISTS CommentLikes(
		comment_id INTEGER NOT NULL,
		created_by VARCHAR(255) NOT NULL,
		is_like BOOLEAN NOT NULL,

		FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
		FOREIGN KEY (created_by) REFERENCES Users(username) ON DELETE CASCADE,
		PRIMARY KEY (comment_id, created_by))`,
		(error, result) => {
			if (error) {
				console.log(error);
			} else {
				console.log("[*] Table 'CommentLikes' created.");
			}
		});


	connection.query(
		`INSERT IGNORE INTO Users(username, password)
			VALUES('admin', 'admin')`,
		(error, result) => {
			if (error) {
				console.log(error);
			} else {
				console.log("[*] 'admin' user created.");
			}
		});
}


createDatabase();



app.post('/', (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: '[* Error *] Both username and password are required' });
	}

	connection.query(
		`SELECT * FROM Users
		WHERE username='${username}' AND password='${password}'`,
		(error, result) => {
			if (error) {
				res.status(500).json({ error: '[* Error *] Failed running sql for user login.' });
			}
			if (result.length == 0) {
				res.status(500).json({ error: '[* Error *] No user found with this username and password' });
			} else {
				res.status(200).json({ info: '[- Info -] User found' });
			}
		});

});


app.post('/AddNewUser', (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ error: '[* Error *] Both username and password are required' });
	}

	connection.query(
		`INSERT INTO Users(username, password)
		VALUES('${username}', '${password}')`, (error, result) => {
		if (error) {
			res.status(500).json({ message: '[* Error *] Saving user failed' });
		} else {
			res.status(200).json({ info: '[- Info -] Saved user successfully' });
		}
	});
});

app.get('/GetChannels', (req, res) => {
	connection.query('SELECT * FROM Channels', (error, result, fields) => {
		if (error) {
			console.log(error);
		} else {
			res.json(result);
		}
	});
});

app.post('/GetQuestions', (req, res) => {
	const { channel_id } = req.body;

	if (!channel_id) {
		return res.status(400).json({ error: '[* Error *] Channel id is required' });
	}

	connection.query(
		`SELECT * FROM Questions WHERE channel_id='${channel_id}'`
		, (error, result) => {
			if (error) {
				res.status(500).json({ "error": error });
			} else if (result) {
				res.status(200).json(result);
			}
		});
});



app.post('/GetComments', (req, res) => {
	const { question_id } = req.body;

	if (!question_id) {
		return res.status(400).json({ error: '[* Error *] Channel id is required' });
	}

	connection.query(
		`SELECT * FROM Comments WHERE question_id='${question_id}'`
		, (error, result) => {
			if (error) {
				res.status(500).json({ "error": error });
			} else if (result) {
				res.status(200).json(result);
			}
		});
});

app.post('/AddChannel', (req, res) => {
	const { name, created_by } = req.body;

	if (!name) {
		return res.status(400).json({ error: '[* Error *] Channel name is required' });
	}

	connection.query(
		`INSERT INTO Channels(name, created_by) VALUES('${name}', '${created_by}')`
		, (error, result) => {
			if (error) {
				res.status(500).json({ "error": error });
			} else if (result) {
				res.status(200).json(result);
			}
		});
});

app.post('/AddQuestion', (req, res) => {
	const { question, image, channel_id, created_by } = req.body;

	if (!question || !channel_id || !created_by) {
		return res.status(400).json({ error: '[* Error *] Channel id, created_by and question text is required' });
	}

	let command = `INSERT INTO Questions(question, channel_id, created_by) VALUES('${question}', '${channel_id}', '${created_by}')`
	if (image) {
		command = `INSERT INTO Questions(question, image, channel_id, created_by) VALUES('${question}', '${image}', '${channel_id}', '${created_by}')`
	}

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});

app.post('/AddComment', (req, res) => {
	const { comment, image, question_id, sub_comment_id, created_by } = req.body;

	if (!comment || !question_id || !created_by) {
		return res.status(400).json({ error: '[* Error *] Comment text, question id and created_by are required' });
	}

	let command;
	if (image && sub_comment_id) {
		command = `INSERT INTO Comments(comment, image, question_id, created_by, sub_comment_id) VALUES('${comment}', '${image}', '${question_id}', '${created_by}', '${sub_comment_id}')`
	} else if (image && !sub_comment_id) {
		command = `INSERT INTO Comments(comment, image, question_id, created_by) VALUES('${comment}', '${image}', '${question_id}', '${created_by}')`
	} else if (!image && sub_comment_id) {
		command = `INSERT INTO Comments(comment, question_id, created_by, sub_comment_id) VALUES('${comment}', '${question_id}', '${created_by}', '${sub_comment_id}')`
	} else {
		command = `INSERT INTO Comments(comment, question_id, created_by) VALUES('${comment}', '${question_id}', '${created_by}')`
	}

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});


app.post('/AddCommentLike', (req, res) => {
	const { comment_id, created_by, is_like } = req.body;

	if (!comment_id || !created_by || is_like == null) {
		return res.status(400).json({ "error": '[* Error *] comment_id, created_by and is_like are required' });
	}

	let command = `INSERT INTO CommentLikes(comment_id, created_by, is_like) VALUES(${comment_id}, '${created_by}', ${is_like})`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			command = `UPDATE Comments SET like_count = like_count + 1 WHERE comment_id=${comment_id}`;
			connection.query(command, (error, result) => {
				if (error) {
					res.status(500).json({ "error": error });
				} else if (result) {
					res.status(200).json(result);
				}
			});
		}
	});
});

app.post('/AddCommentDislike', (req, res) => {
	const { comment_id, created_by, is_like } = req.body;

	if (!comment_id || !created_by || is_like == null) {
		return res.status(400).json({ "error": '[* Error *] comment_id, created_by and is_like are required' });
	}

	let command = `INSERT INTO CommentLikes(comment_id, created_by, is_like) VALUES(${comment_id}, '${created_by}', ${is_like})`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			command = `UPDATE Comments SET dislike_count = dislike_count + 1 WHERE comment_id=${comment_id}`;
			connection.query(command, (error, result) => {
				if (error) {
					res.status(500).json({ "error": error });
				} else if (result) {
					res.status(200).json(result);
				}
			});
		}
	});
});

app.post('/AddQuestionLike', (req, res) => {
	const { question_id, is_like, created_by } = req.body;

	if (!question_id || !is_like || !created_by) {
		return res.status(400).json({ "error": '[* Error *] question_id, is_like and created_by are required' });
	}

	let command = `INSERT INTO QuestionLikes(question_id, is_like, created_by) VALUES(${question_id}, ${is_like}, '${created_by}')`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});

	command = `UPDATE Questions SET like_count = like_count + 1 WHERE question_id=${question_id}`;
	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});


app.post('/SearchChannels', (req, res) => {
	const { key } = req.body;

	if (!key) {
		return res.status(400).json({ error: '[* Error *] table and key are both required' });
	}

	let command = `SELECT * FROM Channels WHERE MATCH(name) AGAINST ('${key}' IN NATURAL LANGUAGE MODE);`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});

app.post('/SearchQuestions', (req, res) => {
	const { key, channel_id } = req.body;

	if (!key || !channel_id) {
		return res.status(400).json({ error: '[* Error *] key and channel_id are both required to search for question.' });
	}

	let command = `SELECT * FROM Questions WHERE channel_id=${channel_id} AND MATCH(question) AGAINST ('${key}' IN NATURAL LANGUAGE MODE);`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});

app.post('/SearchComments', (req, res) => {
	const { key, question_id } = req.body;

	if (!key || !question_id) {
		return res.status(400).json({ error: '[* Error *] key and channel_id are both required to search for question.' });
	}

	let command = `SELECT * FROM Comments WHERE question_id=${question_id} AND MATCH(comment) AGAINST ('${key}' IN NATURAL LANGUAGE MODE);`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});

app.post('/SearchChannelUsers', (req, res) => {
	const { key } = req.body;

	if (!key) {
		return res.status(400).json({ error: '[* Error *] key is required to search for users.' });
	}

	let command = `SELECT * FROM Channels WHERE created_by='${key}'`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});

app.post('/SearchQuestionUsers', (req, res) => {
	const { key, channel_id } = req.body;

	if (!key || !channel_id) {
		return res.status(400).json({ error: '[* Error *] both key and channel id is required to search for users.' });
	}

	let command = `SELECT * FROM Questions WHERE created_by='${key}' AND channel_id=${channel_id}`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});

app.post('/SearchCommentUsers', (req, res) => {
	const { key, question_id } = req.body;

	if (!key || !question_id) {
		return res.status(400).json({ error: '[* Error *] both key and question id is required to search for users.' });
	}

	let command = `SELECT * FROM Comments WHERE created_by='${key}' AND question_id=${question_id}`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});

app.post('/deleteChannel', (req, res) => {
	const { channel_id } = req.body;

	if (!channel_id) {
		return res.status(400).json({ error: '[* Error *] channel id is required for deleting it.' });
	}

	let command = `DELETE FROM Channels WHERE channel_id=${channel_id}`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});

app.post('/deleteQuestion', (req, res) => {
	const { question_id } = req.body;

	if (!question_id) {
		return res.status(400).json({ error: '[* Error *] question id is required for deleting it.' });
	}

	let command = `DELETE FROM Questions WHERE question_id=${question_id}`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});


app.post('/deleteComment', (req, res) => {
	const { comment_id } = req.body;

	if (!comment_id) {
		return res.status(400).json({ error: '[* Error *] comment id is required for deleting it.' });
	}

	let command = `DELETE FROM Comments WHERE comment_id=${comment_id}`

	connection.query(command, (error, result) => {
		if (error) {
			res.status(500).json({ "error": error });
		} else if (result) {
			res.status(200).json(result);
		}
	});
});




app.use(express.static('.'));



app.listen(PORT, (err) => {
	if (err) {
		console.error("Server listen error.");
	}

	console.log(`Server is running on port ${PORT}`);
});
