from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
import os

app = Flask(__name__)

MONGO_URI = os.getenv('MONGODB_URI')
DBS_NAME = os.getenv('MONGO_DB_NAME', 'heroku_6z398f5x')
COLLECTION_NAME = os.getenv('MONGO_COLLECTION_NAME', 'fb_transfers')

# MONGODB_HOST = 'localhost'
# MONGODB_PORT = 27017
# DBS_NAME = 'FB_Transfers12345'
# COLLECTION_NAME = 'transfers'


@app.route("/")
def index():
    """
    A Flask view to serve the main dashboard page.
    """
    return render_template("index.html")


@app.route("/donorsUS/projects")
def donor_projects():
    """
    A Flask view to serve the project data from
    MongoDB in JSON format.
    """

    # A constant that defines the record fields that we wish to retrieve.
    FIELDS = {
        '_id': False, 'WINDOW': True, 'LEAGUE': True,
        'PRICE': True, 'PRICE DESCRIPTION': True,
        'POSITION': True, 'SEASON': True, 'COUNTRY': True, 'TOTAL TRANSFERS': True
    }

    # Open a connection to MongoDB using a with statement such that the
    # connection will be closed as soon as we exit the with statement

    with MongoClient(MONGO_URI) as conn:
        # Define which collection we wish to access
        collection = conn[DBS_NAME][COLLECTION_NAME]
        # Retrieve a result set only with the fields defined in FIELDS
        # and limit the the results to a lower limit of 20000
        projects = collection.find(projection=FIELDS, limit=15000)
        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(projects))


if __name__ == "__main__":
    app.run(debug=True)
