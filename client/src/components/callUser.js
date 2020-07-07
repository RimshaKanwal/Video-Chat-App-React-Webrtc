import React, { useEffect, useState, useRef } from 'react';

import io from 'socket.io-client';
import Peer from 'simple-peer';
import styled from 'styled-components';

const Container = styled.div`
	height: 100vh;
	width: 100%;
	display: flex;
	flex-direction: column;
`;

const Row = styled.div`
	display: flex;
	width: 100%;
`;

const Video = styled.video`
	border: 1px solid blue;
	width: 50%;
	height: 50%;
`;

function CallUser(props) {
	const [user, setUser] = useState('');
	const [userId, setUserId] = useState('');
	const [name, setName] = useState('');

	const [users, setUsers] = useState([]);
	const [stream, setStream] = useState();
	const [receivingCall, setReceivingCall] = useState(false);
	const [caller, setCaller] = useState('');
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);

	const userVideo = useRef();
	const partnerVideo = useRef();
	const socket = useRef();

	useEffect(() => {
		const socketUrl = 'http://localhost:8000';
		socket.current = io(socketUrl).connect('/');

		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				setStream(stream);
				if (userVideo.current) {
					userVideo.current.srcObject = stream;
				}
			});
		socket.current.emit('send-nickname', props.username);
		socket.current.on('user', (user) => {
			setUserId(user.id);
			setUser(user);
			setUsers([...users, user]);
		});
		socket.current.on('allUsers', (user) => {
			setUsers(...users, user);
		});

		socket.current.on('hey', (data) => {
			setReceivingCall(true);
			setCaller(data.from);

			setName(data.fromName);
			setCallerSignal(data.signal);
		});
	}, []);
	var userName = (nameKey, myArray) => {
		for (var i = 0; i < myArray.length; i++) {
			if (myArray[i].id === nameKey) {
				return myArray[i].name;
			}
		}
	};
	function callPeer(id) {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			config: {
				iceServers: [
					{
						urls: 'stun:numb.viagenie.ca',
						username: 'sultan1640@gmail.com',
						credential: '98376683',
					},
					{
						urls: 'turn:numb.viagenie.ca',
						username: 'sultan1640@gmail.com',
						credential: '98376683',
					},
				],
			},
			stream: stream,
		});

		peer.on('signal', (data) => {
			socket.current.emit('callUser', {
				userToCall: id,
				signalData: data,
				from: userId,
			});
		});

		peer.on('stream', (stream) => {
			if (partnerVideo.current) {
				partnerVideo.current.srcObject = stream;
			}
		});

		socket.current.on('callAccepted', (signal) => {
			setCallAccepted(true);
			peer.signal(signal);
		});
	}

	function acceptCall() {
		setCallAccepted(true);
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream,
		});
		peer.on('signal', (data) => {
			socket.current.emit('acceptCall', { signal: data, to: caller });
		});

		peer.on('stream', (stream) => {
			partnerVideo.current.srcObject = stream;
		});

		peer.signal(callerSignal);
	}

	let UserVideo;
	if (stream) {
		UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
	}

	let PartnerVideo;
	if (callAccepted) {
		PartnerVideo = <Video playsInline ref={partnerVideo} autoPlay />;
	}

	let incomingCall;
	if (receivingCall) {
		incomingCall = (
			<div>
				<h1>{name} is calling you</h1>
				<button onClick={acceptCall}>Accept</button>
			</div>
		);
	}
	return (
		<Container>
			<Row>
				{UserVideo}
				{PartnerVideo}
			</Row>

			<Row>
				<button
					onClick={() => {
						users.map((key) => {
							console.log(key.name);
						});
					}}
				>
					users
				</button>

				{users.map((key) => {
					if (key.id === userId) {
						return null;
					}
					return (
						<button onClick={() => callPeer(key.id)}>
							Call {userName(key.id.toString(), users)}
						</button>
					);
				})}
			</Row>
			<Row>{incomingCall}</Row>
		</Container>
	);
}

export default CallUser;
