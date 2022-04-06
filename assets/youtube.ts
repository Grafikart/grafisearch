export  function youtubeThumbnail (url: string): null|string {
    const found = url.match(/v=([^&]+)/);
    if (found && found.length > 0) {
        return `https://img.youtube.com/vi/${found[1]}/mqdefault.jpg`
    }
    return null
}