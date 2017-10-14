function searchFile () {
    let path = document.getElementById('path').value,
        level = document.getElementById('level').value,
        mtime = document.getElementById('mtime').value,
        name = document.getElementById('name').value,
        size = document.getElementById('size').value,
        text = document.getElementById('text').value;

    console.log(path,level,mtime,name,size,text);

    window.location = `/result?path=${path}&level=${level}&mtime=${mtime}&name=${name}&size=${size}&text=${text}`;
}