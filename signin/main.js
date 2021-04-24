function checkParams() {
    var name = $('#login').val();
    var email = $('#email').val();
    var password = $('#password').val();
     

    const button = document.getElementById('submit')

    if(name.length != 0 && email.length != 0 && password.length != 0) {
        //$('#submit').removeAttr('disabled');
        button.disabled = false;
       // $('#submit').removeAttr('disabled');
        console.log('yes')
    } else {
        button.disabled = true;
        //$('#submit').attr('disabled');
        console.log('no')
    }
}