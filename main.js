// const socket = io('http://localhost:3000', {transports: ['websocket']});
const socket = io('https://nguyenhx-stream-app.herokuapp.com/', {transports: ['websocket']});

$("#div-chat").hide();

function openstream(){
    const config = {audio: false, video: true};
    return  navigator.mediaDevices.getUserMedia(config);    
}

function playstream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openstream().then(stream => playstream('localStream', stream));

var peer = new Peer();

peer.on('open', id => {
    $('#mypeer').append(id);
    $('#btnSignUp').click(() => {
        const userName = $("#txtUsername").val();
        socket.emit('NGUOI_DUNG_DANG_KY', {ten:userName, peerId: id});
    });
});

//Caller
$("#btnCall").click(()=>{
  openstream().then(stream =>{
    const id = $('#remoteId').val()
    playstream('localStream', stream);
    const call = peer.call(id, stream);
    call.on('stream', remotestream => playstream('remoteStream', remotestream));
  });  
})

peer.on('call', call=>{
  openstream().then(stream => {
    call.answer(stream);
    playstream('localStream', stream);
    call.on('stream', remotestream => playstream('remoteStream', remotestream));
  });  
})

socket.on('DANH_SACH_ONLINE', UserInfor => {
    $("#div-chat").show();
    $("#div-dangky").hide();
    UserInfor.forEach(user => {
       const {ten, peerId} = user;
       $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    }); 
    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const {ten, peerId} = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });       
});

socket.on('DANG_KY_THAT_BAI', ()=>{
    alert('Vui long chon user khac');
});

socket.on('AI_DO_NGAT_KET_NOI', peerId => {
    $(`#${peerId}`).remove();
})

$('#ulUser').on('click', 'li', function(){
  const id = $(this).attr('id');
  openstream().then(stream => {
    playstream('localStream', stream);
    peer.call(id, stream);    
    peer.on('stream', remotestream => {
        playstream('remoteStream', remotestream);
    })
  });
})