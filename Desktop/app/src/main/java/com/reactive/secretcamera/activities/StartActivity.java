package com.reactive.secretcamera.activities;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.widget.CompoundButton;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SwitchCompat;


import com.github.mikephil.charting.charts.LineChart;
import com.reactive.secretcamera.Constants;
import com.reactive.secretcamera.R;
import com.reactive.secretcamera.Sensor.Accelerometer;
import com.reactive.secretcamera.Sensor.AdvanceSensor;
import com.reactive.secretcamera.Sensor.Plot;

import java.text.DateFormat;
import java.util.Date;

public class StartActivity extends AppCompatActivity {

    public static final String TAG = "StartActivity";

    private SwitchCompat mSwitchCompat;
//    private ToggleButton mToggle; // TODO: remove

    private SensorManager mSensorManager;
    private Sensor mSensor;

    private LineChart mLineChart;
    private Plot mPlot;
    public static AdvanceSensor advanceSensor;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_start);

        mSwitchCompat = (SwitchCompat) findViewById(R.id.switch1);

        mLineChart = (LineChart) findViewById(R.id.chart);

//        mToggle = (ToggleButton) findViewById(R.id.toggleButton);

        mPlot = new Plot(mLineChart);
        mPlot.setUp();

        // set accelerometer sensor
        mSensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        mSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);

        final Accelerometer accelerometer = new Accelerometer(mSensorManager, mSensor, mHandler);
        advanceSensor=new AdvanceSensor(StartActivity.this,mHandler);

        mSwitchCompat.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener(){
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked){
                if(isChecked) {
                    accelerometer.startListening();
                    //advanceSensor.start();
                } else {
                    accelerometer.stopListening();
                    //advanceSensor.onDestroy();
                }
            }
        });
    }



    private final Handler mHandler = new Handler(Looper.getMainLooper()) {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case Constants.MESSAGE_CHANGED:
                    float value = msg.getData().getFloat(Constants.VALUE);
                    mPlot.addEntry(value);
                    break;
                case Constants.MESSAGE_EMERGENCY:
                    new AlertDialog.Builder(StartActivity.this)
                            .setTitle("Fall")
                            .setMessage("Falling Falling")
                            .setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    dialog.dismiss();
                                }
                            })
                            .show();
                    mSwitchCompat.setChecked(false);

                    break;
                case Constants.MESSAGE_TOAST:
                    Toast.makeText(getApplicationContext(),msg.getData().getString(Constants.TOAST),
                            Toast.LENGTH_SHORT).show();
                    break;
            }
        }
    };

}
