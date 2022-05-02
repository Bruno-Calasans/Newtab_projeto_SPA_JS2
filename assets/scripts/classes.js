

    import {get, create, insert, isArray, isString, moneyFormat} from './functions.js'
    const key = 'transactions'

     // adiciona novos métodos para todo objeto e string
     class ObjectManager{

        constructor(){this.config()}

        config(){

            // converte um objeto para array
            Object.prototype.toArray = function(){return Object.values(this)}

            // compara se dois objetos são iguais usando um valor de chave como critério
            Object.prototype.isEqual = function(obj2, key, caseSensitive=true, strict=true){

                let valor1 = this[key]
                let valor2 = obj2[key]

                // diferencia o tipo e o valor
                if(strict){
                
                    // caso sejam strings e não diferencia maiúsculas e minúsculas
                    if(isString(valor1) && isString(valor2) && !caseSensitive)
                        return valor1.toLowerCase() === valor2.toLowerCase()

                    // caso sejam qualquer tipo de dado
                    else
                        return valor1 === valor2
                }

                // diferencia apenas o valor
                else{

                    // caso sejam strings e não diferencia maiúsculas e minúsculas
                    if(isString(valor1) && isString(valor2) && !caseSensitive)
                        return valor1.toLowerCase() == valor2.toLowerCase()
                
                    // caso sejam qualquer tipo de dado
                    else
                        return valor1 == valor2
                }

            }

            // transforma um string monetária em número
            String.prototype.toNumber = function(){

                let num = this.replace(/[^\d\.,]/g, '')

                let antesVirgula = num
                    .match(/[\d+\.]+(?=,)/g)[0]
                    .replace(/\.+/g, '')

                let depoisVirgula = num
                    .match(/,\d+/g)[0]
                    .replace(/,+/, '.') 
        
                return Number(antesVirgula + depoisVirgula)
            }
                
        }
    }

    // iniciando um classe já configurada
    const objsConfig = new ObjectManager()

    // adiciona novos métodos para o LocalStorage
    class LocalStorageManager{

        constructor(){
            // config incial
            this.config()
        }

        // adiciona novos métodos para o local storage
        config(){

            // salva um objeto na Local Storage
            Storage.prototype.saveObj = function (key, obj){

                if(!isObj(obj)) return false
                let json = [JSON.stringify(obj)]
                this.setItem(key, json)
            }

            // salva vários objetos na local storage em forma de array
            Storage.prototype.saveObjs = function(key, ...objs){

                if(objs.length == 1 && isArray(objs[0]))objs = objs[0]
                let array = JSON.stringify(objs)
                this.setItem(key, array)
            }

            // pega todos os objetos da local storage de uma determinada key
            Storage.prototype.getObjs = function (key){

                // verificando se algum valor para essa chave
                let strObjArray = this.getItem(key)
                if(!strObjArray) return null

                // transformando cada string obj em array
                let objArray = JSON.parse(strObjArray)
                return objArray
            }

            // verifica se uma determinada chave existe no local storage
            Storage.prototype.keyExists = function (key){
                return this.getItem(key) ? true : false
            }

             // verifica se um determinado objeto existe no local storage
             Storage.prototype.objExists = function(key, objComparado, objKey){

                // verificando se a chave existe
                if(!this.keyExists(key)) return null

                let objs = this.getObjs(key)

                for(let obj of objs){

                    let resultado = objComparado.isEqual(obj, objKey, false)
                    if(resultado) return true
                }
                return false
            }

            // verifica se vários objetos existem
            Storage.prototype.objsExist = function(key, objs, objKey, cb){

                if(!this.keyExists(key)) return null

                // objetos que serão comparados
                for(let obj of objs){
                    let existe = this.objExists(key, obj, objKey)
                    cb(obj, existe)
                }

            }

            // atualizando array de objs
            Storage.prototype.insertObjs = function (key, ...objs){

                if(objs.length == 1 && isArray(objs[0])) objs = objs[0]

                // verificando se a key existe
                if(!this.keyExists(key)) return null

                let arrayObjs = this.getObjs(key)
                let novoArray = [...arrayObjs, ...objs]
                this.saveObjs(key, novoArray)
            }
        }

    }

    // inciando a classe já configurada
    const LSConfig = new LocalStorageManager

    // representa uma transação
    class Transaction{

        constructor(name, value, type=0){

            const types = ['buy', 'sale']
            this.name = name
            this.value = value
            this.type = types[type]
        }
    }

    class TransactionsManager{

        constructor(...transactions){

            // elementos principais
            this.elementoContainer = get('transactions')
            this.elementoResultado = get('resultado')
            this.resultado = {total: 0, situação: ''}
            this.transactions = []

            // array de transactions
            if(transactions.length == 1 && isArray(transactions[0]))
            transactions = transactions[0]

            // configurações inicias
            if(transactions.length > 0) this.insert(false, transactions)
        }

        // transforma um elemento transaction com um obj transaction
        createHtml(obj){

            if(!obj) return null

            const type = obj.type
            const name = obj.name
            const value = obj.value

            // elemento transaction
            const transaction = create('div', 'transaction')

            // partes do elemento transaction
            const transactionType = create('div', `transaction-type ${type}`)
            const productName = create('div', 'product-name', name)
            const productValue = create('div', 'product-value', `${moneyFormat(value)}`)

            let elementos = [transactionType, productName, productValue]

            // inserindo elementos dentro do elemento transaction
            insert(transaction, elementos)
            
            return transaction
        }

        // transaforma vários objs transaction em elementos transactions
        createHtmls(...objs){

            objs = objs.length == 1 ? objs[0] : objs
            let array = []
            for(let obj of objs) array.push(this.createHtml(obj))
            return array
        }

        // insere um ou vários elementos transaction no container
        insert(repeat=false, ...objs){

            // limpando o container
            if(this.transactions.length == 0) 
                this.elementoContainer.innerHTML = ''

            if(objs.length == 1 && isArray(objs[0])) objs = objs[0]

            let htmls = this.createHtmls(objs)
            insert(this.elementoContainer, htmls)

            this.updateTransactions(objs)
            this.updateResultado()

            // se já existir uma key no local storage
            if(localStorage.keyExists(key)){

                // se puder repetir elementos
                if(repeat){
                    localStorage.insertObjs(key, objs)
                    
                // caso não possa repetir elementos
                }else{
                    localStorage.objsExist(key, objs, 'name', (obj, existe) => {
                        if(!existe) localStorage.insertObjs(key, obj)
                    })
                }
            }
              
            // caso não exista nenhuma key
            else
              localStorage.saveObjs(key, objs)
        }

        // atualiza o resultado geral das transações
        updateResultado(){

            // Calculando a total das transações
            this.resultado.total = 0

            for(let transaction of this.transactions){

                let value = transaction.value

                if(transaction.type == 'buy') 
                    this.resultado.total -= value
                else 
                    this.resultado.total += value
            }

            // determinando a situação
            const total = this.resultado.total

            if(total < 0)
                this.resultado.situação = '[Prejuízo]'

            else if(total == 0) 
                this.resultado.situação = ''

            else 
                this.resultado.situação = '[Lucro]'

            // atualizando o elemento resultado
            this.elementoResultado.innerHTML = `
            ${moneyFormat(this.resultado.total)} ${this.resultado.situação}`
        }

        // atualiza os objs dentro de this.transactions
        updateTransactions(...objs){

            if(objs.length == 1 && isArray(objs)) objs = objs[0]
            for(let obj of objs) this.transactions.push(obj)
        }

        clear(){

            // limpando transactions
            this.transactions = []

            // limpando os elementos do container
            while(this.elementoContainer.children.length > 0)
            this.elementoContainer.children[0].remove()

            // atualizando o objeto resultado
            this.resultado = {total: 0, situação: ''}

            // atualizando o elemento resultado
            this.elementoResultado.innerHTML = ''

            // inserindo mensagem no container
            this.elementoContainer.innerHTML = 'Nenhuma transação cadastrada'

            // limpando o localstorage
            localStorage.clear()
        }
    }

    export {key, Transaction, TransactionsManager, objsConfig, LSConfig}