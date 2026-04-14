const res = await fetch("http://localhost:8000/chat",{
    method: "POST",
});

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log(decoder.decode(value));
    }