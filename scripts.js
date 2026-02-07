let chaveIA = ""
const chaveTempo = "52f8aa7c877a37367dc282b8da89537c"

/* ===== BACKGROUND DINÂMICO ===== */
function trocarBackground(clima) {
    let tags = "weather,sky"

    if (clima === "Clear") tags = "sunny,blue-sky"
    else if (clima === "Clouds") tags = "cloudy,overcast"
    else if (clima === "Rain" || clima === "Drizzle") tags = "rain,clouds"
    else if (clima === "Thunderstorm") tags = "storm,lightning"
    else if (clima === "Snow") tags = "snow,winter"
    else if (["Mist", "Fog", "Haze"].includes(clima)) tags = "fog,mist"

    document.body.style.backgroundImage =
        `url("https://loremflickr.com/1600/900/${tags}?random=${Date.now()}")`
}

/* ===== BUSCAR CLIMA ===== */
async function cliqueiNoBotao() {
    const cidade = document.querySelector(".input-cidade").value
    const caixa = document.querySelector(".caixa-media")

    if (!cidade) return

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${chaveTempo}&units=metric&lang=pt_br`

    const resposta = await fetch(url)
    const dados = await resposta.json()

    trocarBackground(dados.weather[0].main)

    caixa.innerHTML = `
        <h2 class="cidade">${dados.name}</h2>
        <p class="temp">${Math.floor(dados.main.temp)} °C</p>
        <img src="https://openweathermap.org/img/wn/${dados.weather[0].icon}.png">
        <p class="umidade">Umidade: ${dados.main.humidity}%</p>
        <button class="botao-ia" onclick="pedirSugestaoRoupa()">Sugestão de Roupa</button>
        <p class="resposta-ia"></p>
    `
}

/* ===== VOZ ===== */
function detectaVoz() {
    const reconhecimento = new webkitSpeechRecognition()
    reconhecimento.lang = "pt-BR"
    reconhecimento.start()

    reconhecimento.onresult = (evento) => {
        document.querySelector(".input-cidade").value =
            evento.results[0][0].transcript
        cliqueiNoBotao()
    }
}

/* ===== IA ===== */
async function pedirSugestaoRoupa() {
    const respostaIA = document.querySelector(".resposta-ia")
    const botaoIA = document.querySelector(".botao-ia")

    // Desativa botão
    botaoIA.disabled = true

    // Loading bonito 😍
    respostaIA.innerHTML = `
        <div class="loading-ia fade">
            <div class="spinner"></div>
            <span>🤖💭 Pensando na melhor roupa pra você...<span class="pontos"></span></span>
        </div>
    `

    // Pequena pausa pra UX
    await new Promise(resolve => setTimeout(resolve, 1200))

    let temperatura = document.querySelector(".temp").textContent
    let umidade = document.querySelector(".umidade").textContent
    let cidade = document.querySelector(".cidade").textContent

    let resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + chaveIA
        },
        body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "user",
                    content: `Me dê uma sugestão de qual roupa usar hoje.
                    Cidade: ${cidade}
                    Temperatura: ${temperatura}
                    Umidade: ${umidade}.
                    Responda em 1 ou 2 frases curtas.`
                }
            ]
        })
    })

    let dados = await resposta.json()

    // Mostra resposta final
    respostaIA.innerHTML = `
        <p class="fade">${dados.choices[0].message.content}</p>
    `

    // Reativa botão
    botaoIA.disabled = false
}

