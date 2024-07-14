import os
import json
import telebot
import threading
import time
from dotenv import load_dotenv

BOT_TOKEN = os.getenv("BOT_TOKEN")
PASSWORD = os.getenv("PASSWORD") 

bot = telebot.TeleBot(BOT_TOKEN)

json_filename = './purchases.json'
chat_ids_filename = './chat_ids.json'
trigger_file = './trigger.txt'

pending_registrations = {}

@bot.message_handler(commands=['register'])
def register_chat_id(message):
    chat_id = message.chat.id
    
    if is_user_registered(chat_id):
        bot.reply_to(message, "You are already registered to receive updates.")
        return

    pending_registrations[chat_id] = True
    bot.reply_to(message, "Please enter the registration password:")

@bot.message_handler(func=lambda msg: msg.chat.id in pending_registrations)
def handle_password(message):
    chat_id = message.chat.id
    password = message.text

    if password == PASSWORD:
        store_chat_id(chat_id)
        bot.reply_to(message, "You have successfully been registered to receive updates.")
    else:
        bot.reply_to(message, "Incorrect password. Registration failed.")

    del pending_registrations[chat_id]

@bot.message_handler(commands=['unregister'])
def unregister_chat_id(message):
    chat_id = message.chat.id
    
    if not is_user_registered(chat_id):
        bot.reply_to(message, "You are not registered to receive updates.")
        return
    
    remove_chat_id(chat_id)
    bot.reply_to(message, "You have been unregistered from receiving updates.")

@bot.message_handler(func=lambda msg: True)
def handle_general_messages(message):
    chat_id = message.chat.id
    if is_user_registered(chat_id):
        bot.reply_to(message, "Waiting for new purchases....\nIf you want to unregister, send /unregister")
    else:
        bot.reply_to(message, "If you want to register, send /register")

def is_user_registered(chat_id):
    if not os.path.exists(chat_ids_filename):
        return False

    with open(chat_ids_filename, 'r') as file:
        chat_ids = json.load(file)
    
    return chat_id in chat_ids

def store_chat_id(chat_id):
    if not os.path.exists(chat_ids_filename):
        chat_ids = []
    else:
        with open(chat_ids_filename, 'r') as file:
            chat_ids = json.load(file)

    if chat_id not in chat_ids:
        chat_ids.append(chat_id)
        with open(chat_ids_filename, 'w') as file:
            json.dump(chat_ids, file)

def remove_chat_id(chat_id):
    if not os.path.exists(chat_ids_filename):
        return

    with open(chat_ids_filename, 'r') as file:
        chat_ids = json.load(file)

    if chat_id in chat_ids:
        chat_ids.remove(chat_id)
        with open(chat_ids_filename, 'w') as file:
            json.dump(chat_ids, file)

def send_new_purchases():
    if not os.path.exists(chat_ids_filename):
        return

    with open(chat_ids_filename, 'r') as file:
        chat_ids = json.load(file)

    if not os.path.exists(json_filename):
        message = "JSON file not found."
        for chat_id in chat_ids:
            bot.send_message(chat_id, message)
        return

    try:
        with open(json_filename, 'r') as json_file:
            data = json.load(json_file)
    except json.JSONDecodeError:
        message = "Error decoding JSON file."
        for chat_id in chat_ids:
            bot.send_message(chat_id, message)
        return

    if data:
        first_entry = data.pop(0)
        entry_message = json.dumps(first_entry, indent=4)
        with open(json_filename, 'w') as json_file:
            json.dump(data, json_file, indent=4)
        
        for chat_id in chat_ids:
            bot.send_message(chat_id, entry_message)

def watch_for_triggers():
    while True:
        if os.path.exists(trigger_file):
            send_new_purchases()
            os.remove(trigger_file)
        time.sleep(1)

if __name__ == '__main__':
    bot_thread = threading.Thread(target=bot.infinity_polling)
    bot_thread.start()
    watch_for_triggers()
