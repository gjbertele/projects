package javaprojects.misc;

public class neuralnetwork {
    public static void main(String[] args){
        float[][][] network = new float[][][]{{{-3,2,-5},{3,-2,5},{1,0,0}},{{1,1,1},{0,0,0},{0,0,0}}};
        forwardPass(network, new float[]{1,2,3});

    }
    public static float sigmoid(float x){
        return 1/(1 + Math.pow(Math.E, -x));
    }
    public static float forwardPass(float[][][] layers, float[] inputs){
        float[] clayer = new float[layers[0].length];
        for(int i = 0; i<inputs.length; i++){
            clayer[i] = inputs[i];
        }
        for(float[][] layer : layers){
            float[] nextLayer = new int[layers[0].length];
            for(int i = 0; i<layer.length; i++){
                float[] neuron = layer[i];
                float value = 0;
                for(int j = 0; j<neuron.length; j++){
                    if(neuron[j] == 0) break;
                    value += clayer[j]*neuron[j];
                }
                nextLayer[i] = value;
            }
            clayer = nextLayer;
        }
        System.out.println(Arrays.toString(clayer));
        return 0;
    }
}