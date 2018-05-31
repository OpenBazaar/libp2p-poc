$(function() {
    $('#submitForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            type: "GET",
            url: "http://localhost:4002/ob/peerinfo/" + $('#peerID').val(),
            success: function(data){
                alert("Pubkey: " + data.pubkey)
                dialer.dial("here");
            },
            error: function(result) {
               alert("Peerinfo not found");
            },
            dataType: "json"
        });
    });
});
