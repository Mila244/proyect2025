from flask import Flask
from flask_cors import CORS
from auth import auth_bp
from products import products_bp
from predict import predict_bp
from protected import protected_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(predict_bp)
app.register_blueprint(protected_bp)

if __name__ == "__main__":
    app.run(debug=True)
