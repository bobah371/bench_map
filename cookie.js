// name - имя cookie
// value - значение cookie
// [expires] - дата окончания действия cookie (по умолчанию - до конца сессии)
// [path] - путь, для которого cookie действительно (по умолчанию - документ, в котором значение было установлено)
// [domain] - домен, для которого cookie действительно (по умолчанию - домен, в котором значение было установлено)
// [secure] - логическое значение, показывающее требуется ли защищенная передача значения cookie

function setCookie(name, value, expires, path, domain, secure) {
    var curCookie = name + "=" + escape(value) +
            ((expires) ? "; expires=" + expires.toGMTString() : "") +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "")
    if (!caution || (name + "=" + escape(value)).length <= 4000)
            document.cookie = curCookie
    else
            if (confirm("Cookie превышает 4KB и будет вырезан !"))
                    document.cookie = curCookie
}

// name - имя считываемого cookie

function getCookie(name) {
    var prefix = name + "="
    var cookieStartIndex = document.cookie.indexOf(prefix)
    if (cookieStartIndex == -1)
            return null
    var cookieEndIndex = document.cookie.indexOf(";", cookieStartIndex + prefix.length)
    if (cookieEndIndex == -1)
            cookieEndIndex = document.cookie.length
    return unescape(document.cookie.substring(cookieStartIndex + prefix.length, cookieEndIndex))
}